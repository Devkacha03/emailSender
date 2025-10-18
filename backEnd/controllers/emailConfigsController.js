import Email from "../models/emailConfig.js";
import { createTransporter } from "../utils/mailTransporter.js";
import { extractEmailsFromFile } from "../utils/email/extractEmails.js";
import {
  sendEmailsInBatches,
  sendEmailsSequentially,
} from "../utils/email/emailBulkSender.js";
import { cleanupFiles } from "../utils/file/fileCleanup.js";
import { emailIsValidAndRemoveDuplicate } from "../utils/email/emailValidator.js";
import { globalErrorHandler } from "./errorsManager.js";
import { encrypt, decrypt } from "../utils/encryptDecrypt.js";
import csvParser from "csv-parser";

//* store mail configeration
export const setEmailConfig = async (req, res) => {
  try {
    const { service, email, password } = req.body;
    const data = await Email.findOne({ userId: req.user._id }).lean();

    const hashPassword = encrypt(password);
    if (!data)
      await Email.create({
        userId: req.user.id,
        service,
        email,
        password: hashPassword,
      });
    else return globalErrorHandler(res, 409);

    return res.status(200).json({
      message: "Email configuration saved",
      config: { service, email },
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
    config.password = decrypt(config.password);

    const transport = createTransporter(config);

    const attachments =
      req.files?.map((file) => ({
        filename: file.originalname,
        path: file.path,
      })) || [];

    const mailOptions = {
      from: config.email,
      to,
      subject,
      // text: message,
      html: `<p>${message.replace(/\n/g, "<br>")}</p>`,
      attachments,
    };

    await transport.sendMail(mailOptions);

    return res.status(200).json({ message: "Email sent successfully", to });
  } catch (error) {
    console.log(error);
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

    // ✅ Extract emails with better error handling
    const emailList = await extractEmailsFromFile(mailFile);

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
      uploadedFiles
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

    let emailList = emailIsValidAndRemoveDuplicate(emails.split(","));
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
      attachments
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
