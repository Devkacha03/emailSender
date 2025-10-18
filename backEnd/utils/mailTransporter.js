import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

if (!process.env.EPORT || !process.env.SECURE)
  throw new Error("Data not set in process.env file");

// Configure Zoho SMTP
export const createTransporter = (config) => {
  return nodemailer.createTransport({
    service: config.service,
    auth: {
      user: config.email,
      pass: config.password,
    },
  });
};
