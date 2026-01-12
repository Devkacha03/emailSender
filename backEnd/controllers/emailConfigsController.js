import Email from "../models/emailConfig.js";
import EmailLogs from "../models/emailLogs.js";
import { createTransporter } from "../utils/mailTransporter.js";
import { extractEmailsFromFile, extractEmailsWithNamesFromFile } from "../utils/email/extractEmails.js";
import {
  sendEmailsInBatches,
  sendEmailsSequentially,
} from "../utils/email/emailBulkSender.js";
import { cleanupFiles } from "../utils/file/fileCleanup.js";
import { emailIsValidAndRemoveDuplicate, parseEmailsFromText } from "../utils/email/emailValidator.js";
import { globalErrorHandler } from "./errorsManager.js";
import { encrypt, decrypt } from "../utils/encryptDecrypt.js";
import csvParser from "csv-parser";

//* store mail configeration
export const setEmailConfig = async (req, res) => {
  try {
    const { service, email, password, host, port, secure } = req.body;
    const data = await Email.findOne({ userId: req.user._id }).lean();

    const hashPassword = encrypt(password);
    
    const configData = {
      userId: req.user.id,
      service,
      email,
      password: hashPassword,
    };
    
    // Add custom SMTP settings if service is custom
    if (service === 'custom') {
      configData.host = host;
      configData.port = port || 587;
      configData.secure = secure || false;
    }
    
    if (!data) {
      await Email.create(configData);
    } else {
      return globalErrorHandler(res, 409);
    }

    return res.status(200).json({
      message: "Email configuration saved",
      config: { service, email, host, port, secure },
    });
  } catch (error) {
    console.error(error.message);
    return globalErrorHandler(res, 500);
  }
};

//* Fetch mail config data
export const getEmailConfig = async (req, res) => {
  try {
    const config = await Email.findOne({ userId: req.user._id }).lean();

    if (!config)
      return globalErrorHandler(res, 404, "configuration not found!");

    res.status(200).json({
      service: config.service,
      email: config.email,
      password: config.password,
      host: config.host,
      port: config.port,
      secure: config.secure,
    });
  } catch (error) {
    console.error(error.message);
    return globalErrorHandler(res, 500);
  }
};

//* send Single Mail
export const sendSingleEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message)
      return globalErrorHandler(res, 400, "Field are Missing");

    const config = req.user; //* Get configuration Data
    
    // Validate email configuration exists
    if (!config.email || !config.password) {
      return globalErrorHandler(res, 400, "Email configuration is incomplete. Please configure your email settings first.");
    }
    
    config.password = decrypt(config.password);
    
    console.log(`📧 Attempting to send email from ${config.email} to ${to}`);
    
    const transport = createTransporter(config);

    const attachments =
      req.files?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })) || [];

    // ✅ Create new EmailLog entry before sending
    const newLog = new EmailLogs({
      userId: config.userId,
      emailConfigId: config._id,
      subject,
      isBulk: false,
      recipients: [{ email: to, status: "pending" }],
      overallStatus: "pending",
    });
    await newLog.save();

    const mailOptions = {
      from: config.email,
      to,
      subject,
      // text: message,
      html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
      attachments,
    };

    try {
      await transport.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${to}`);

      // ✅ Update log on success
      newLog.recipients[0].status = "success";
      newLog.overallStatus = "success";
      newLog.recipients[0].sentAt = new Date();
      newLog.sentAt = new Date();
      await newLog.save();

      return res.status(200).json({ message: "Email sent successfully", to });
    } catch (error) {
      console.error("❌ Email sending error:", error.message);
      console.error("Error details:", error);

      let errorMessage = error.message;
      
      // Provide helpful error messages for common issues
      if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        errorMessage = "Connection timeout. Your firewall or ISP may be blocking SMTP ports (465/587). Try: 1) Disable antivirus temporarily, 2) Use a different network (mobile hotspot), or 3) Contact your network administrator.";
      } else if (error.code === 'EAUTH' || error.responseCode === 535) {
        errorMessage = "Authentication failed. Make sure you're using a Gmail App Password (not your regular password). Generate one at: https://myaccount.google.com/apppasswords";
      } else if (error.code === 'ECONNECTION') {
        errorMessage = "Cannot connect to email server. Check your internet connection.";
      }

      // ✅ Update log (failure)
      newLog.recipients[0].status = "failed";
      newLog.recipients[0].sentAt = new Date();
      newLog.recipients[0].errorMessage = errorMessage;
      newLog.overallStatus = "failed";
      newLog.sentAt = new Date();
      await newLog.save();

      return globalErrorHandler(res, 500, errorMessage);
    }
  } catch (error) {
    console.error(error);
    console.error(error.message);
    return globalErrorHandler(res, 500);
  }
};

//* send bulk mail via file (excel or csv)
export const sendBulkViaFile = async (req, res) => {
  let uploadedFiles = [];
  try {
    const { subject, message } = req.body;

    // ✅ Validate required fields early
    if (!subject || !message)
      return globalErrorHandler(res, 400, "Field are Missing");

    const config = req.user; //* Get configuration
    config.password = decrypt(config.password);

    // ✅ Check for required fields
    if (!req.files?.["docs"]?.[0])
      return globalErrorHandler(
        res,
        400,
        "Please upload a document file (xlsx/csv)"
      );

    const mailFile = req.files["docs"][0];
    const attachments = req.files["attachments"] || [];

    // Track uploaded files for cleanup
    uploadedFiles = [mailFile, ...attachments];

    // ✅ Extract emails WITH names for personalization
    const emailList = await extractEmailsWithNamesFromFile(mailFile);

    if (emailList.length === 0) {
      await cleanupFiles(uploadedFiles);
      return globalErrorHandler(
        res,
        400,
        "No valid email addresses found in file"
      );
    }

    // ✅ Prepare attachments (if any)
    const mailAttachments = attachments.map((file) => ({
      filename: file.originalname,
      path: file.path,
    }));

    const results = await sendEmailsSequentially(
      config,
      emailList,
      subject,
      message,
      mailAttachments,
      uploadedFiles,
      config.userId,
      config._id
    );

    return res.status(202).json({
      message: "Bulk email completed",
      total: emailList.length,
      successful: results.successful,
      failed: results.failed,
      estimatedTime: `${Math.ceil((emailList.length * 30) / 60)} minutes`,
      errors:
        results.errors.length > 0 ? results.errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    console.error("Bulk email error:", error.message);

    await cleanupFiles(uploadedFiles); // ✅ Cleanup files on error

    return globalErrorHandler(res, 500);
  }
};

//* send bulk mail via text
export const sendBulkEmailViaText = async (req, res) => {
  try {
    const { subject, message, emails } = req.body;

    if (!subject || !message || !emails)
      return globalErrorHandler(
        res,
        400,
        "please add subject or message or emails!"
      );
    const config = req.user; //* Get configuration
    config.password = decrypt(config.password);

    // ✅ Parse emails with names for personalization
    let emailList = parseEmailsFromText(emails);
    const attachments = req.files["attachments"] || [];

    if (emailList.length === 0) {
      await cleanupFiles(attachments);
      return globalErrorHandler(
        res,
        400,
        "No valid email addresses found in file"
      );
    }
    // ✅ Prepare attachments (if any)
    const mailAttachments = attachments.map((file) => ({
      filename: file.originalname,
      path: file.path,
    }));

    const results = await sendEmailsSequentially(
      config,
      emailList,
      subject,
      message,
      mailAttachments,
      attachments,
      config.userId,
      config._id
    );
    return res.status(202).json({
      message: "Bulk email completed",
      total: emailList.length,
      successful: results.successful,
      failed: results.failed,
      estimatedTime: `${Math.ceil((emailList.length * 30) / 60)} minutes`,
      errors:
        results.errors.length > 0 ? results.errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    console.error(error.message);
    await cleanupFiles(attachments);
    return globalErrorHandler(res, 500);
  }
};
