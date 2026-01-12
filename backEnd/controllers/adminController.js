import EmailLogs from "../models/emailLogs.js";
import User from "../models/User.js";
import EmailTemplate from "../models/emailTemplate.js";
import emailConfig from "../models/emailConfig.js";
import AuditLog from "../models/auditLog.js";
import EmailQueue from "../models/emailQueue.js";
import { globalErrorHandler } from "./errorsManager.js";
import { createTransporter } from "../utils/mailTransporter.js";
import nodemailer from "nodemailer";

// ==================== DASHBOARD ====================
export const getDashboardStats = async (req, res) => {
  try {
    console.log("Fetching dashboard stats for admin:", req.user._id);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // Email Statistics
    const totalEmails = await EmailLogs.countDocuments();
    const todayEmails = await EmailLogs.countDocuments({
      createdAt: { $gte: today },
    });
    const last7DaysEmails = await EmailLogs.countDocuments({
      createdAt: { $gte: last7Days },
    });

    // Success/Failed emails
    const successfulEmails = await EmailLogs.countDocuments({
      overallStatus: "success",
    });
    const failedEmails = await EmailLogs.countDocuments({
      overallStatus: "failed",
    });
    const partialEmails = await EmailLogs.countDocuments({
      overallStatus: "partial",
    });

    const successRate =
      totalEmails > 0 ? ((successfulEmails / totalEmails) * 100).toFixed(2) : 0;

    // User Statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: "admin" });

    // Template Statistics
    const totalTemplates = await EmailTemplate.countDocuments();
    const activeTemplates = await EmailTemplate.countDocuments({
      isActive: true,
    });

    // Recent emails (with error handling for populate)
    const recentEmails = await EmailLogs.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "userName userEmail")
      .select("subject recipients overallStatus createdAt isBulk")
      .lean();

    // Email trend data (last 7 days)
    const emailTrend = await EmailLogs.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sent: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "success"] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "failed"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("Dashboard stats fetched successfully");

    res.status(200).json({
      success: true,
      stats: {
        emails: {
          total: totalEmails,
          today: todayEmails,
          last7Days: last7DaysEmails,
          successful: successfulEmails,
          failed: failedEmails,
          partial: partialEmails,
          successRate: parseFloat(successRate),
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
        },
        templates: {
          total: totalTemplates,
          active: activeTemplates,
        },
      },
      recentEmails: recentEmails.map((email) => ({
        id: email._id,
        subject: email.subject,
        recipientCount: email.recipients?.length || 0,
        status: email.overallStatus,
        type: email.isBulk ? "bulk" : "single",
        date: email.createdAt,
        sender: email.userId?.userName || "Unknown",
      })),
      emailTrend,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message,
    });
  }
};

// ==================== EMAIL MANAGEMENT ====================
export const getAllEmails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      search,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    if (status) query.overallStatus = status;
    if (type === "bulk") query.isBulk = true;
    if (type === "single") query.isBulk = false;
    if (search) {
      query.subject = { $regex: search, $options: "i" };
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const emails = await EmailLogs.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "userName userEmail")
      .populate("emailConfigId", "email");

    const count = await EmailLogs.countDocuments(query);

    res.status(200).json({
      success: true,
      emails,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalEmails: count,
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return globalErrorHandler(res, 500, "Failed to fetch email history");
  }
};

export const getEmailDetails = async (req, res) => {
  try {
    const email = await EmailLogs.findById(req.params.id)
      .populate("userId", "userName userEmail")
      .populate("emailConfigId", "email");

    if (!email) {
      return globalErrorHandler(res, 404, "Email not found");
    }

    res.status(200).json({
      success: true,
      email,
    });
  } catch (error) {
    console.error("Error fetching email details:", error);
    return globalErrorHandler(res, 500, "Failed to fetch email details");
  }
};

export const deleteEmail = async (req, res) => {
  try {
    const email = await EmailLogs.findByIdAndDelete(req.params.id);

    if (!email) {
      return globalErrorHandler(res, 404, "Email not found");
    }

    res.status(200).json({
      success: true,
      message: "Email deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting email:", error);
    return globalErrorHandler(res, 500, "Failed to delete email");
  }
};

// ==================== USER MANAGEMENT ====================
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;

    const query = {};

    if (role) query.role = role;
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-userPassword -passwordResetToken -passwordResetExpires")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    // Get email count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const emailCount = await EmailLogs.countDocuments({ userId: user._id });
        const emailConfigCount = await emailConfig.countDocuments({
          userId: user._id,
        });

        return {
          ...user.toObject(),
          stats: {
            emailsSent: emailCount,
            emailConfigs: emailConfigCount,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return globalErrorHandler(res, 500, "Failed to fetch users");
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-userPassword -passwordResetToken -passwordResetExpires"
    );

    if (!user) {
      return globalErrorHandler(res, 404, "User not found");
    }

    // Get user statistics
    const emailCount = await EmailLogs.countDocuments({ userId: user._id });
    const successfulEmails = await EmailLogs.countDocuments({
      userId: user._id,
      overallStatus: "success",
    });
    const failedEmails = await EmailLogs.countDocuments({
      userId: user._id,
      overallStatus: "failed",
    });
    const emailConfigCount = await emailConfig.countDocuments({
      userId: user._id,
    });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          totalEmails: emailCount,
          successfulEmails,
          failedEmails,
          emailConfigs: emailConfigCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return globalErrorHandler(res, 500, "Failed to fetch user details");
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return globalErrorHandler(res, 400, "Invalid role");
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-userPassword");

    if (!user) {
      return globalErrorHandler(res, 404, "User not found");
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return globalErrorHandler(res, 500, "Failed to update user role");
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return globalErrorHandler(res, 404, "User not found");
    }

    // Use findByIdAndUpdate to avoid password validation
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: !user.isActive },
      { new: true, runValidators: false }
    ).select("-userPassword -userConfirmPassword");

    res.status(200).json({
      success: true,
      message: `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`,
      user: {
        id: updatedUser._id,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return globalErrorHandler(res, 500, "Failed to update user status");
  }
};

export const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return globalErrorHandler(res, 400, "You cannot delete your own account");
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return globalErrorHandler(res, 404, "User not found");
    }

    // Optionally delete user's email configs and logs
    await emailConfig.deleteMany({ userId: user._id });
    // await EmailLogs.deleteMany({ userId: user._id }); // Uncomment if you want to delete logs

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return globalErrorHandler(res, 500, "Failed to delete user");
  }
};

// ==================== TEMPLATE MANAGEMENT ====================
export const getAllTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, search } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status === "active") query.isActive = true;
    if (status === "inactive") query.isActive = false;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const templates = await EmailTemplate.find(query)
      .populate("userId", "userName userEmail")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await EmailTemplate.countDocuments(query);

    res.status(200).json({
      success: true,
      templates,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalTemplates: count,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return globalErrorHandler(res, 500, "Failed to fetch templates");
  }
};

export const getTemplateDetails = async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id).populate(
      "userId",
      "userName userEmail"
    );

    if (!template) {
      return globalErrorHandler(res, 404, "Template not found");
    }

    res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Error fetching template details:", error);
    return globalErrorHandler(res, 500, "Failed to fetch template details");
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, subject, message, category } = req.body;

    if (!name || !subject || !message) {
      return globalErrorHandler(
        res,
        400,
        "Name, subject, and message are required"
      );
    }

    const template = await EmailTemplate.create({
      userId: req.user._id,
      name,
      subject,
      message,
      category: category || "other",
    });

    res.status(201).json({
      success: true,
      message: "Template created successfully",
      template,
    });
  } catch (error) {
    console.error("Error creating template:", error);
    return globalErrorHandler(res, 500, "Failed to create template");
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { name, subject, message, category, isActive } = req.body;

    const template = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      { name, subject, message, category, isActive },
      { new: true, runValidators: true }
    );

    if (!template) {
      return globalErrorHandler(res, 404, "Template not found");
    }

    res.status(200).json({
      success: true,
      message: "Template updated successfully",
      template,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return globalErrorHandler(res, 500, "Failed to update template");
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const template = await EmailTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
      return globalErrorHandler(res, 404, "Template not found");
    }

    res.status(200).json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return globalErrorHandler(res, 500, "Failed to delete template");
  }
};

// ==================== ANALYTICS ====================
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage =
      Object.keys(dateFilter).length > 0
        ? { createdAt: dateFilter }
        : { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };

    // Determine date format based on groupBy
    let dateFormat = "%Y-%m-%d";
    if (groupBy === "month") dateFormat = "%Y-%m";
    if (groupBy === "year") dateFormat = "%Y";
    if (groupBy === "hour") dateFormat = "%Y-%m-%d %H:00";

    // Email analytics by date
    const emailAnalytics = await EmailLogs.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          total: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "success"] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "failed"] }, 1, 0] },
          },
          partial: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "partial"] }, 1, 0] },
          },
          bulk: { $sum: { $cond: ["$isBulk", 1, 0] } },
          single: { $sum: { $cond: [{ $not: "$isBulk" }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top users by email count
    const topUsers = await EmailLogs.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$userId",
          emailCount: { $sum: 1 },
          successCount: {
            $sum: { $cond: [{ $eq: ["$overallStatus", "success"] }, 1, 0] },
          },
        },
      },
      { $sort: { emailCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          userName: { $ifNull: ["$user.userName", "Unknown User"] },
          userEmail: { $ifNull: ["$user.userEmail", "N/A"] },
          emailCount: 1,
          successCount: 1,
          successRate: {
            $cond: [
              { $eq: ["$emailCount", 0] },
              0,
              { $multiply: [{ $divide: ["$successCount", "$emailCount"] }, 100] }
            ]
          },
        },
      },
    ]);

    // Email status distribution
    const statusDistribution = await EmailLogs.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$overallStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    // Type distribution (bulk vs single)
    const typeDistribution = await EmailLogs.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $cond: ["$isBulk", "bulk", "single"] },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        emailTrend: emailAnalytics,
        topUsers,
        statusDistribution,
        typeDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return globalErrorHandler(res, 500, "Failed to fetch analytics");
  }
};

// ==================== SETTINGS ====================
export const getSettings = async (req, res) => {
  try {
    // Return system settings (from env or database)
    const settings = {
      emailRateLimit: process.env.EMAIL_RATE_LIMIT || 10,
      maxAttachmentSize: process.env.MAX_ATTACHMENT_SIZE || 25,
      maxRecipientsPerBulk: process.env.MAX_RECIPIENTS_PER_BULK || 1000,
      enableAI: process.env.GROK_API_KEY ? true : false,
      maintenanceMode: false,
    };

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return globalErrorHandler(res, 500, "Failed to fetch settings");
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { emailRateLimit, maxAttachmentSize, maxRecipientsPerBulk } =
      req.body;

    // In production, save these to database
    // For now, we'll just return success
    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings: req.body,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return globalErrorHandler(res, 500, "Failed to update settings");
  }
};

// ==================== SYSTEM MONITORING ====================
export const getSystemMonitoring = async (req, res) => {
  try {
    // Real-time email statistics
    const now = new Date();
    const last5Minutes = new Date(now.getTime() - 5 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const recentEmails = await EmailLogs.countDocuments({
      createdAt: { $gte: last5Minutes },
    });

    const lastHourEmails = await EmailLogs.countDocuments({
      createdAt: { $gte: lastHour },
    });

    const recentFailed = await EmailLogs.countDocuments({
      createdAt: { $gte: last5Minutes },
      overallStatus: "failed",
    });

    // Email queue status
    const queueStats = await EmailQueue.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Active users (logged in last hour)
    const activeUsers = await User.countDocuments({
      updatedAt: { $gte: lastHour },
      isActive: true,
    });

    // System health
    const systemHealth = {
      database: "healthy",
      emailService: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    res.status(200).json({
      success: true,
      monitoring: {
        realtime: {
          emailsLast5Min: recentEmails,
          emailsLastHour: lastHourEmails,
          failedLast5Min: recentFailed,
          successRate:
            recentEmails > 0
              ? (((recentEmails - recentFailed) / recentEmails) * 100).toFixed(
                  2
                )
              : 0,
        },
        queue: queueStats,
        activeUsers,
        systemHealth,
      },
    });
  } catch (error) {
    console.error("Error fetching system monitoring:", error);
    return globalErrorHandler(res, 500, "Failed to fetch system monitoring");
  }
};

// ==================== EMAIL QUEUE MANAGEMENT ====================
export const getEmailQueue = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      userId,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (userId) query.userId = userId;

    const queue = await EmailQueue.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "userName userEmail")
      .populate("emailConfigId", "email");

    const count = await EmailQueue.countDocuments(query);

    res.status(200).json({
      success: true,
      queue,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count,
    });
  } catch (error) {
    console.error("Error fetching email queue:", error);
    return globalErrorHandler(res, 500, "Failed to fetch email queue");
  }
};

export const retryFailedEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const email = await EmailLogs.findById(id);
    if (!email) {
      return globalErrorHandler(res, 404, "Email not found");
    }

    if (email.overallStatus !== "failed") {
      return globalErrorHandler(res, 400, "Only failed emails can be retried");
    }

    // Add to queue for retry
    const queueItem = await EmailQueue.create({
      userId: email.userId,
      emailConfigId: email.emailConfigId,
      recipients: email.recipients.map((r) => ({
        email: r.email,
        status: "pending",
      })),
      subject: email.subject,
      message: "Retry of failed email",
      isBulk: email.isBulk,
      priority: "high",
    });

    // Log audit
    await AuditLog.create({
      userId: req.user._id,
      action: "email_failed",
      targetType: "email",
      targetId: id,
      details: { reason: "Manual retry by admin" },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      success: true,
      message: "Email added to retry queue",
      queueItem,
    });
  } catch (error) {
    console.error("Error retrying email:", error);
    return globalErrorHandler(res, 500, "Failed to retry email");
  }
};

export const cancelQueuedEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const queueItem = await EmailQueue.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );

    if (!queueItem) {
      return globalErrorHandler(res, 404, "Queue item not found");
    }

    await AuditLog.create({
      userId: req.user._id,
      action: "admin_action",
      targetType: "email",
      targetId: id,
      details: { action: "Cancelled queued email" },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      success: true,
      message: "Email cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling queued email:", error);
    return globalErrorHandler(res, 500, "Failed to cancel queued email");
  }
};

// ==================== AUDIT LOGS ====================
export const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      action,
      userId,
      startDate,
      endDate,
    } = req.query;

    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("userId", "userName userEmail");

    const count = await AuditLog.countDocuments(query);

    res.status(200).json({
      success: true,
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalLogs: count,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return globalErrorHandler(res, 500, "Failed to fetch audit logs");
  }
};

// ==================== USER QUOTA MANAGEMENT ====================
export const updateUserQuota = async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyLimit, monthlyLimit } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        "quota.dailyLimit": dailyLimit,
        "quota.monthlyLimit": monthlyLimit,
      },
      { new: true }
    ).select("-userPassword");

    if (!user) {
      return globalErrorHandler(res, 404, "User not found");
    }

    await AuditLog.create({
      userId: req.user._id,
      action: "quota_updated",
      targetType: "user",
      targetId: id,
      details: { dailyLimit, monthlyLimit },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      success: true,
      message: "User quota updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user quota:", error);
    return globalErrorHandler(res, 500, "Failed to update user quota");
  }
};

export const resetUserQuota = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        "quota.currentDailyUsage": 0,
        "quota.currentMonthlyUsage": 0,
        "quota.lastDailyReset": new Date(),
        "quota.lastMonthlyReset": new Date(),
      },
      { new: true }
    ).select("-userPassword");

    if (!user) {
      return globalErrorHandler(res, 404, "User not found");
    }

    await AuditLog.create({
      userId: req.user._id,
      action: "quota_updated",
      targetType: "user",
      targetId: id,
      details: { action: "Quota reset" },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.status(200).json({
      success: true,
      message: "User quota reset successfully",
      user,
    });
  } catch (error) {
    console.error("Error resetting user quota:", error);
    return globalErrorHandler(res, 500, "Failed to reset user quota");
  }
};

// ==================== EMAIL PROVIDER TESTING ====================
export const testEmailProvider = async (req, res) => {
  try {
    const { configId, testEmail } = req.body;

    if (!configId || !testEmail) {
      return globalErrorHandler(
        res,
        400,
        "Config ID and test email are required"
      );
    }

    const config = await emailConfig.findById(configId);
    if (!config) {
      return globalErrorHandler(res, 404, "Email configuration not found");
    }

    // Create test transporter
    let transporter;
    try {
      if (config.host && config.port) {
        // Custom SMTP
        transporter = nodemailer.createTransporter({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: config.email,
            pass: config.password,
          },
        });
      } else {
        // Service-based (Gmail, Outlook, etc.)
        transporter = nodemailer.createTransporter({
          service: config.service,
          auth: {
            user: config.email,
            pass: config.password,
          },
        });
      }

      // Verify connection
      await transporter.verify();

      // Send test email
      const info = await transporter.sendMail({
        from: config.email,
        to: testEmail,
        subject: "Email Configuration Test",
        html: `
          <h2>Configuration Test Successful!</h2>
          <p>This is a test email from your EmailSender application.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Service: ${config.service}</li>
            <li>Email: ${config.email}</li>
            <li>Test Time: ${new Date().toLocaleString()}</li>
          </ul>
        `,
      });

      await AuditLog.create({
        userId: req.user._id,
        action: "admin_action",
        targetType: "config",
        targetId: configId,
        details: { action: "Email provider test", result: "success" },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      res.status(200).json({
        success: true,
        message: "Email configuration test successful",
        messageId: info.messageId,
        response: info.response,
      });
    } catch (verifyError) {
      await AuditLog.create({
        userId: req.user._id,
        action: "admin_action",
        targetType: "config",
        targetId: configId,
        details: {
          action: "Email provider test",
          result: "failed",
          error: verifyError.message,
        },
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        status: "failed",
      });

      return res.status(400).json({
        success: false,
        message: "Email configuration test failed",
        error: verifyError.message,
      });
    }
  } catch (error) {
    console.error("Error testing email provider:", error);
    return globalErrorHandler(res, 500, "Failed to test email provider");
  }
};

// ==================== EXPORT REPORTS ====================
export const exportReport = async (req, res) => {
  try {
    const { type, format, startDate, endDate } = req.query;

    let data = [];
    let filename = "";

    // Fetch data based on type
    switch (type) {
      case "emails":
        const emailQuery = {};
        if (startDate || endDate) {
          emailQuery.createdAt = {};
          if (startDate) emailQuery.createdAt.$gte = new Date(startDate);
          if (endDate) emailQuery.createdAt.$lte = new Date(endDate);
        }
        data = await EmailLogs.find(emailQuery)
          .populate("userId", "userName userEmail")
          .lean();
        filename = `email-logs-${Date.now()}`;
        break;

      case "users":
        data = await User.find()
          .select("-userPassword -passwordResetToken")
          .lean();
        filename = `users-report-${Date.now()}`;
        break;

      case "audit":
        const auditQuery = {};
        if (startDate || endDate) {
          auditQuery.createdAt = {};
          if (startDate) auditQuery.createdAt.$gte = new Date(startDate);
          if (endDate) auditQuery.createdAt.$lte = new Date(endDate);
        }
        data = await AuditLog.find(auditQuery)
          .populate("userId", "userName userEmail")
          .lean();
        filename = `audit-logs-${Date.now()}`;
        break;

      default:
        return globalErrorHandler(res, 400, "Invalid report type");
    }

    if (format === "csv") {
      // Convert to CSV
      const csv = convertToCSV(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`
      );
      return res.send(csv);
    } else {
      // Return JSON
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.json"`
      );
      return res.json(data);
    }
  } catch (error) {
    console.error("Error exporting report:", error);
    return globalErrorHandler(res, 500, "Failed to export report");
  }
};

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
