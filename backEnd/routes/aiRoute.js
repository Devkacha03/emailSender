import express from "express";
const aiRoute = express.Router();

import { generateEmailContent } from "../controllers/aiController.js";
import { checkUserAuth } from "../middleware/authMiddleware.js";

// AI email generation route (protected)
aiRoute.post("/generate-email", checkUserAuth, generateEmailContent);

export default aiRoute;
