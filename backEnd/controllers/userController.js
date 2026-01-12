import User from "../models/User.js";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";

import { regGenerateToken } from "../utils/token.js";
import { globalErrorHandler, mongooseErrorHandler } from "./errorsManager.js";
import { createTransporter } from "../utils/mailTransporter.js";

dotenv.config();

export const signUp = async (req, res) => {
  try {
    let { userName, userEmail, userPassword, userConfirmPassword, role } = req.body;

    const user = await User.create({
      userName,
      userEmail,
      userPassword,
      userConfirmPassword,
      role: role || "user", // Use provided role or default to "user"
    });

    const regToken = regGenerateToken(user._id);

    res.status(200).json({
      status: "success",
      token: regToken,
      userDetail: { 
        _id: user._id,
        userName: user.userName, 
        userEmail: user.userEmail,
        role: user.role 
      },
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
      userDetail: { 
        _id: user._id,
        userName: user.userName, 
        userEmail: user.userEmail,
        role: user.role 
      },
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

    if (!userData) {
      return res.status(404).json({ 
        status: "error",
        message: "No account found with this email address" 
      });
    }

    const resetToken = await userData.createPasswordResetToken();
    await userData.save({ validateBeforeSave: false }); // SAVE RESET TOKEN WITH EXPIRY DATE IN DB

    // CREATE URL FOR FRONTEND RESET PAGE (NOT API ENDPOINT)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // CREATE HTML EMAIL MESSAGE
    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have requested to reset your password. Click the button below to reset your password:</p>
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 10 minutes for security reasons.
            </div>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>&copy; ${new Date().getFullYear()} Email Sender Application. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const { EHOST, EMAIL, GPASSWORD } = process.env;

    if (!EHOST || !EMAIL || !GPASSWORD) {
      return res.status(500).json({ 
        status: "error",
        message: "Email configuration is missing. Please contact administrator." 
      });
    }

    const config = {
      service: EHOST,
      email: EMAIL,
      password: GPASSWORD,
    };

    const transporter = createTransporter(config);

    await transporter.sendMail({
      from: `"Email Sender App" <${EMAIL}>`,
      to: email,
      subject: "Password Reset Request - Action Required",
      html: htmlMessage,
    });

    return res.status(200).json({ 
      status: "success",
      message: `Password reset link has been sent to ${email}` 
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error.message);
    
    // Clean up the reset token if email fails
    if (userData) {
      userData.passwordResetToken = undefined;
      userData.passwordResetExpires = undefined;
      await userData.save({ validateBeforeSave: false });
    }
    
    return res.status(500).json({ 
      status: "error",
      message: "Failed to send password reset email. Please try again later." 
    });
  }
};

export const setNewPassword = async (req, res) => {
  try {
    const user = req.user; // GET ALL VALUE PASSING ON THE MIDDLEWARE

    const { newPassword, confirmPassword } = req.body; // GET VALUE FROM THE USER

    // CHECK NEW AND CONFIRM PASSWORD IF NOT MATCHED
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        status: "error",
        message: "New password and confirm password do not match" 
      });
    }

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

    if (!updateUser) {
      return res.status(404).json({ 
        status: "error",
        message: "User not found" 
      });
    }

    const loginToken = regGenerateToken(updateUser._id);
    
    return res.status(200).json({ 
      status: "success",
      message: "Password has been reset successfully", 
      token: loginToken 
    });
  } catch (error) {
    console.error("Error in setNewPassword:", error.message);
    return res.status(500).json({ 
      status: "error",
      message: "Failed to reset password. Please try again." 
    });
  }
};
