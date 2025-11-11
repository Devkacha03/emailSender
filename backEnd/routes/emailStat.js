import express from "express";
import {
  getEmailLogs,
  emailAnalytics,
} from "../controllers/emailStateController.js";
import { checkUserAuth } from "../middleware/authMiddleware.js";

const emailStatRoute = express.Router();

emailStatRoute.get("/get-email-logs", checkUserAuth, getEmailLogs);
emailStatRoute.get("/email-analytics", checkUserAuth, emailAnalytics);

export default emailStatRoute;
