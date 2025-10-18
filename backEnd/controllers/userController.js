import User from "../models/User.js";
import dotenv from "dotenv";

import { regGenerateToken } from "../utils/token.js";
import { globalErrorHandler, mongooseErrorHandler } from "./errorsManager.js";

dotenv.config();

export const signUp = async (req, res) => {
  try {
    let { userName, userEmail, userPassword } = req.body;

    const user = await User.create({ userName, userEmail, userPassword });

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
