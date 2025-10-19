import express from "express";
const userRoute = express.Router();

import {
  signIn,
  signUp,
  userProfile,
  changePassword,
  forgotPassword,
  setNewPassword,
} from "../controllers/userController.js";
import {
  checkUserAuth,
  forgotPasswordAuth,
} from "../middleware/authMiddleware.js";
import {
  regValidationMiddleware,
  loginValidationMiddleware,
  changePasswordValidatioMiddleware,
  forgotPasswordValidationMiddleware,
  setNewPasswordValidation,
} from "../middleware/validationMiddleware.js";

// Example route
userRoute.post("/signUp", regValidationMiddleware, signUp);

userRoute.post("/signIn", loginValidationMiddleware, signIn);

userRoute.get("/profile", checkUserAuth, userProfile);

userRoute.post(
  "/change-password",
  changePasswordValidatioMiddleware,
  checkUserAuth,
  changePassword
);

userRoute.post(
  "/forgot-password",
  forgotPasswordValidationMiddleware,
  forgotPassword
);

userRoute.patch(
  "/setUpdatingPassword/:token",
  forgotPasswordAuth,
  setNewPasswordValidation,
  setNewPassword
);
export default userRoute;
