import mongoose from "mongoose";
import validator from "validator";

const recipientSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Recipient email is required."],
    lowercase: true,
    trim: true,
    validate: {
      validator: (value) => validator.isEmail(value),
      message: "Invalid recipient email address.",
    },
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "pending",
  },
  sentAt: {
    type: Date,
  },
  errorMessage: {
    type: String,
    trim: true,
    default: null,
  },
});

const emailLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: [true, "User ID is required"],
    },
    emailConfigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "emailconfigs",
      required: [true, "Email Config ID is required"],
    },
    subject: {
      type: String,
      required: [true, "Email subject is required"],
    },
    isBulk: {
      type: Boolean,
      default: false,
    },
    recipients: {
      type: [recipientSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one recipient is required.",
      },
    },
    overallStatus: {
      type: String,
      enum: ["success", "partial", "failed", "pending"],
      default: "pending",
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const EmailLogs = mongoose.model("EmailLog", emailLogSchema);

export default EmailLogs;
