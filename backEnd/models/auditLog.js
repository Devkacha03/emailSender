import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "user_created",
        "user_updated",
        "user_deleted",
        "user_suspended",
        "user_activated",
        "email_sent",
        "email_failed",
        "email_deleted",
        "template_created",
        "template_updated",
        "template_deleted",
        "config_updated",
        "login",
        "logout",
        "password_changed",
        "role_changed",
        "quota_updated",
        "admin_action",
      ],
    },
    targetType: {
      type: String,
      enum: ["user", "email", "template", "config", "system"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
