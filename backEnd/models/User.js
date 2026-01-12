import mongoose from "mongoose";
import validator from "validator";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "Please Provide your Name"],
    },
    userEmail: {
      type: String,
      required: [true, "Please Provide your Email"],
      lowercase: true,
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Invalid Email Format"],
    },
    userPassword: {
      type: String,
      required: [true, "Please Provide your Password"],
      trim: true,
      minlength: 8,
    },
    userConfirmPassword: {
      type: String,
      required: [function() { return this.isNew; }, "please Provide Confirm Password"],
      trim: true,
      minlength: 8,
      validate: {
        validator: function (pw) {
          return pw === this.userPassword;
        },
        message: "password and confirm password not matched",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Quota Management
    quota: {
      dailyLimit: {
        type: Number,
        default: 100,
      },
      monthlyLimit: {
        type: Number,
        default: 3000,
      },
      currentDailyUsage: {
        type: Number,
        default: 0,
      },
      currentMonthlyUsage: {
        type: Number,
        default: 0,
      },
      lastDailyReset: {
        type: Date,
        default: Date.now,
      },
      lastMonthlyReset: {
        type: Date,
        default: Date.now,
      },
    },
    passwordChangeAt: { type: Date, default: Date.now },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
  },
  { timestamps: true }
);

//* CHECK PASSWORD IS HASHING
userSchema.pre("save", async function (next) {
  if (!this.isModified("userPassword")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.userPassword = await bcryptjs.hash(this.userPassword, salt);
    this.userConfirmPassword = undefined;
    next();
  } catch (error) {
    console.error(error);
    next();
    // process.exit(0);
  }
});

//* COMPARE PASSWORD
userSchema.methods.matchPassword = async function (
  candidatePassword,
  clientPassword
) {
  return await bcryptjs.compare(candidatePassword, clientPassword);
};

//* PASSWORD RESET/FORGOT TOKEN
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  const finalToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetToken = finalToken;

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return finalToken;
};

const User = mongoose.model("Users", userSchema);
export default User;
