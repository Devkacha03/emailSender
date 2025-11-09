import { globalErrorHandler } from "./errorsManager.js";
import EmailLogs from "../models/emailLogs.js";

export const getEmailLogs = async (req, res) => {
  try {
    const { _id } = req.user;

    const logs = await EmailLogs.find({ userId: _id })
      .sort({ createdAt: -1 })
      .lean()
      .select("-__v -emailConfigId -createdAt -updatedAt");

    return res.status(200).json({
      success: true,
      length: logs.length,
      emailLogs: logs,
    });
  } catch (error) {
    console.error(error.message);
    globalErrorHandler(res, 500);
  }
};
