import express from "express";
const mail = express.Router();

import {
  setEmailConfig,
  getEmailConfig,
  sendSingleEmail,
  sendBulkViaFile,
  sendBulkEmailViaText,
} from "../controllers/emailConfigsController.js";
import { checkUserAuth } from "../middleware/authMiddleware.js";
import { serviceValidationMiddleware } from "../middleware/validationMiddleware.js";
import { emailConfig } from "../middleware/emailConfigMiddleware.js";
import { upload, docsUpload } from "../utils/fileUploadConfig.js";

mail.post(
  "/email-config",
  serviceValidationMiddleware,
  checkUserAuth,
  setEmailConfig
);
mail.get("/email-config", checkUserAuth, getEmailConfig);

mail.post(
  "/send-single-mail",
  checkUserAuth,
  emailConfig,
  upload.array("attachments", 5),
  sendSingleEmail
);

mail.post(
  "/send-bulk-mail-file",
  checkUserAuth,
  emailConfig,
  docsUpload.fields([
    { name: "docs", maxCount: 1 },
    { name: "attachments", maxCount: 3 },
  ]),
  sendBulkViaFile
);

mail.post(
  "/send-bulk-mail-text",
  checkUserAuth,
  emailConfig,
  docsUpload.fields([{ name: "attachments", maxCount: 3 }]),
  sendBulkEmailViaText
);

export default mail;
