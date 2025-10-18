import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const emailConfigSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      unique: true,
    },
    service: {
      type: String,
      default: "gmail",
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Email = mongoose.model("EmailConfig", emailConfigSchema);

export default Email;
