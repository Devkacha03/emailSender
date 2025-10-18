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
  },
  { timestamps: true }
);

//* CHECK PASSWORD IS HASHING
userSchema.pre("save", async function (next) {
  if (!this.isModified("userPassword")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.userPassword = await bcryptjs.hash(this.userPassword, salt);
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

const User = mongoose.model("Users", userSchema);
export default User;
