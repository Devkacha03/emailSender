import { globalErrorHandler } from "./errorsManager.js";
import EmailLogs from "../models/emailLogs.js";
import mongoose from "mongoose";

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

export const emailAnalytics = async (req, res) => {
  try {
    const totalSentEmails = await EmailLogs.countDocuments({
      userId: req.user._id,
    });
    const totalFailedEmails = await EmailLogs.countDocuments({
      userId: req.user._id,
      overallStatus: "failed",
    });
    const totalPendingEmails = await EmailLogs.countDocuments({
      userId: req.user._id,
      overallStatus: "pending",
    });
    const totalSuccessEmails = await EmailLogs.countDocuments({
      userId: req.user._id,
      overallStatus: "success",
    });

    // Last 7 days data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyState = await EmailLogs.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          sentAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
          total: { $sum: 1 },
          success: {
            $sum: {
              $cond: {
                if: { $eq: ["$overallStatus", "success"] },
                then: 1,
                else: 0,
              },
            },
          },
          failed: {
            $sum: {
              $cond: {
                if: { $eq: ["$overallStatus", "failed"] },
                then: 1,
                else: 0,
              },
            },
          },
          pending: {
            $sum: {
              $cond: {
                if: { $eq: ["$overallStatus", "pending"] },
                then: 1,
                else: 0,
              },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: "Email analytics fetched successfully",
      data: {
        totalSentEmails,
        totalFailedEmails,
        totalPendingEmails,
        totalSuccessEmails,
        dailyState,
        successRate: (totalSuccessEmails / totalSentEmails) * 100,
        failureRate: (totalFailedEmails / totalSentEmails) * 100,
        pendingRate: (totalPendingEmails / totalSentEmails) * 100,
      },
    });
  } catch (error) {
    console.error(error.message);
    globalErrorHandler(res, 500);
  }
};
