import express from "express";
const userRoute = express.Router();

import { signIn, signUp, userProfile } from "../controllers/userController.js";
import { checkUserAuth } from "../middleware/authMiddleware.js";
import {
  regValidationMiddleware,
  loginValidationMiddleware,
} from "../middleware/validationMiddleware.js";

// Example route
userRoute.post("/signUp", regValidationMiddleware, signUp);
userRoute.post("/signIn", loginValidationMiddleware, signIn);
userRoute.get("/profile", checkUserAuth, userProfile);

export default userRoute;
