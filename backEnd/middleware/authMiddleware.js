import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

import {
  clientTokenError,
  globalErrorHandler,
} from "../controllers/errorsManager.js";
dotenv.config();

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
