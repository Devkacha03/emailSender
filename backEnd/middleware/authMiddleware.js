import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

import {
  clientTokenError,
  globalErrorHandler,
} from "../controllers/errorsManager.js";
dotenv.config();

//! CHECK TOKEN IS EXPIRAY OR NOT
function checkClientReloginPasswordChange(tokenTime, updateTime) {
  updateTime = parseInt(updateTime.getTime() / 1000, 10);

  if (tokenTime < updateTime) return true;

  return false;
}

export const checkUserAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decodeToken = jwt.verify(token, process.env.ACCESS_JWT_SECRET); // DECODE TOKEN

      // FIND USER BASED ON ID EXTRACT FROM DECODE TOKEN
      const userInfo = await User.findById(decodeToken.id).select(
        "-userPassword"
      );

      if (!userInfo) return globalErrorHandler(res, 404, "User not found");

      const expired = checkClientReloginPasswordChange(
        decodeToken.iat,
        userInfo.passwordChangeAt
      );

      if (expired)
        return globalErrorHandler(
          res,
          400,
          "recently change password! please signIn again"
        );

      req.user = userInfo; // SET USER INFO IN REQ.USER
      next();
    } else {
      return globalErrorHandler(res, 401, "Not authorized, no token");
    }

    if (!token) return globalErrorHandler(res, 401, "Not authorized, no token");
  } catch (error) {
    console.error("Error in auth middleware:", error.message);
    return clientTokenError(error.name, error, res);
  }
};

export const forgotPasswordAuth = async (req, res, next) => {
  try {
    const { token } = req.params; // GET TOKEN IN PARAMETER

    if (!token) return globalErrorHandler(res, 401); // RETURN ERROR IF TOKEN IS NOT EXIST

    // FIND USER BASED ON TOKEN AND EXPIRY DATE
    const userInfos = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    // IF USER NOT GET
    if (!userInfos)
      return globalErrorHandler(res, 400, `Token is invalid or has expired`);

    req.user = userInfos;
    next();
  } catch (error) {
    console.error(error.message);
    console.error(error.name);
    return globalErrorHandler(res, 500);
  }
};
