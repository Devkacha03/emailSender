import mongoose from "mongoose";

const emailQueueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    emailConfigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailConfig",
      required: true,
    },
    recipients: [
      {
        email: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "processing", "sent", "failed"],
          default: "pending",
        },
      },
    ],
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isBulk: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    scheduledAt: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    lastAttemptAt: Date,
    errorMessage: String,
    processedAt: Date,
  },
  { timestamps: true }
);

// Index for efficient queue processing
emailQueueSchema.index({ status: 1, priority: -1, scheduledAt: 1 });
emailQueueSchema.index({ userId: 1, status: 1 });

const EmailQueue = mongoose.model("EmailQueue", emailQueueSchema);

export default EmailQueue;
