import User from "../models/User.js";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";

import { regGenerateToken } from "../utils/token.js";
import { globalErrorHandler, mongooseErrorHandler } from "./errorsManager.js";
import { createTransporter } from "../utils/mailTransporter.js";

dotenv.config();

export const signUp = async (req, res) => {
  try {
    let { userName, userEmail, userPassword, userConfirmPassword } = req.body;

    const user = await User.create({
      userName,
      userEmail,
      userPassword,
      userConfirmPassword,
    });

    const regToken = regGenerateToken(user._id);

    res.status(200).json({
      status: "success",
      token: regToken,
      userDetail: { userName: user.userName, userEmail: user.userEmail },
    });
  } catch (error) {
    console.error("Error in user sign-up:", error.message);
    if (error.name === "ValidationError")
      return mongooseErrorHandler(res, error, error.name);
    if (error.code === 11000)
      return mongooseErrorHandler(res, error, error.code);

    return globalErrorHandler(res, 500);
  }
};

export const signIn = async (req, res) => {
  try {
    const { userEmail, userPassword } = req.body;

    const user = await User.findOne({ userEmail });

    if (!user) return globalErrorHandler(res, 404);

    if (!(await user.matchPassword(userPassword, user.userPassword)))
      return globalErrorHandler(res, 401);

    const regToken = regGenerateToken(user._id);

    res.status(200).json({
      status: "success",
      token: regToken,
      userDetail: { userName: user.userName, userEmail: user.userEmail },
    });
  } catch (error) {
    console.error("Error in user sign-in:", error.message);
    return globalErrorHandler(res, 500);
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-__v -createdAt -updatedAt"
    );

    if (!user) return globalErrorHandler(res, 404);

    res.status(200).json({ data: user });
  } catch (error) {
    console.error("Error in fetching user profile:", error.message);
    return globalErrorHandler(res, 500);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confimPassword } = req.body;
    const { _id } = req.user;

    const userInfo = await User.findOne(_id);

    if (!userInfo) return globalErrorHandler(res, 404);

    if (!(await userInfo.matchPassword(currentPassword, userInfo.userPassword)))
      return globalErrorHandler(res, 401, "Current Password not correct");

    // CHECK CURRENT PASSWORD AND NEW PASSWORD IF MATCH
    if (await userInfo.matchPassword(newPassword, userInfo.userPassword))
      return globalErrorHandler(
        res,
        403,
        `New password can't be the same as the current password`
      );

    // CHECK IF NEW AND CONFIRM PASSWORD ARE NOT SAME
    if (newPassword !== confimPassword)
      return globalErrorHandler(
        res,
        403,
        "New password and confirm password do not match"
      );

    const salt = await bcryptjs.genSalt(10); // DEFINE NUMBER OF (ROUND OF SALTING)
    const passwordToHash = await bcryptjs.hash(newPassword, salt); // NEW PASSWORD CONVERT TO HASHING

    // JSON OF UPDATING DATA IN DB
    const updateClientPasswordInfo = {
      userPassword: passwordToHash,
      passwordChangeAt: new Date(),
    };

    // FIND AND UPDATE DATA IN DB
    const updateUsers = await User.findByIdAndUpdate(
      _id,
      updateClientPasswordInfo,
      { new: true, runValidators: true }
    );

    return res.status(200).json({ message: "password Updated" });
  } catch (error) {
    console.error(error.message);
    return globalErrorHandler(res, 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const userData = await User.findOne({ userEmail: email });

    if (!userData) return globalErrorHandler(res, 404);
    console.log(userData);

    const resetToken = await userData.createPasswordResetToken();

    await userData.save({ validateBeforeSave: false }); // SAVE RESET TOKEN WITH EXPIRY DATE IN DB

    // CREATE URL FOR SENDING WITH EMAIL MESSAGE
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/users/setUpdatingPassword/${resetToken}`;

    const message = `change your password Following This Url : ${resetUrl}`; //CREATE MESSAGE FOR SENDING EMAIL

    const { EHOST, EMAIL, GPASSWORD } = process.env;

    if (!EHOST || !EMAIL || !GPASSWORD) return globalErrorHandler(res, 404);

    const config = {
      service: EHOST,
      email: EMAIL,
      password: GPASSWORD,
    };

    const trasnporter = createTransporter(config);

    await trasnporter.sendMail({
      from: EMAIL,
      to: email,
      subject: "password Reset Token",
      html: message,
    });

    return res
      .status(200)
      .json({ message: `password Reset Token Sent to your ${email} email` });
  } catch (error) {
    console.error(error.message);
    userData.passwordRestToken = ""; //SET passwordRestToken TOKEN UNDEFINED IF ERROR
    userData.passwordRestExpires = ""; //SET passwordRestExpires TOKEN UNDEFINED IF ERROR
    await userData.save({ validateBeforeSave: false }); // SAVE ABOVE VALUE IN DB
    return globalErrorHandler(res, 500);
  }
};

export const setNewPassword = async (req, res) => {
  try {
    const user = req.user; // GET ALL VALUE PASSING ON THE MIDDLEWARE

    const { newPassword, confirmPassword } = req.body; // GET VALUE FROM THE USER

    // CHECK NEW AND CONFIRM PASSWORD IF NOT MATCHED
    if (newPassword !== confirmPassword)
      return globalErrorHandler(
        res,
        400,
        "newPassword and ConfirmPassword do not matched"
      );

    const salt = await bcryptjs.genSalt(10); // DEFINE NUMBER OF (ROUND OF SALTING)
    const passwordToHash = await bcryptjs.hash(newPassword, salt); // NEW PASSWORD CONVERT TO HASHING

    // FIND AND UPDATE VALUE IN DB
    const updateUser = await User.findByIdAndUpdate(
      user._id,
      {
        userPassword: passwordToHash,
        passwordChangeAt: new Date(),
        $unset: {
          passwordResetToken: "",
          passwordResetExpires: "",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    const loginToken = regGenerateToken(updateUser._id);
    return res
      .status(200)
      .json({ message: "set new password calling", token: loginToken });
  } catch (error) {
    console.error(error.message);
    return globalErrorHandler(res, 500);
  }
};
