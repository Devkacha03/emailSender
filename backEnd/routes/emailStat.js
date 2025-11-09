import express from "express";
import { getEmailLogs } from "../controllers/emailStateController.js";
import { checkUserAuth } from "../middleware/authMiddleware.js";

const emailStatRoute = express.Router();

emailStatRoute.get("/get-email-logs", checkUserAuth, getEmailLogs);

export default emailStatRoute;
