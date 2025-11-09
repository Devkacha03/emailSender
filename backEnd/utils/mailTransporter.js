import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

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
