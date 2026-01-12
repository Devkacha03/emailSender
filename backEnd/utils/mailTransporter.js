import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Configure email SMTP - Try port 465 (SSL) as it may work when 587 is blocked
export const createTransporter = (config) => {
  let transportConfig;

  // If custom service with host and port, use those settings
  if (config.service === 'custom' && config.host && config.port) {
    transportConfig = {
      host: config.host,
      port: config.port,
      secure: config.secure || false,
      auth: {
        user: config.email,
        pass: config.password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    };
  } else if (config.service === 'gmail') {
    transportConfig = {
      host: 'smtp.gmail.com',
      port: 465, // Using SSL port instead of TLS port 587
      secure: true, // Use SSL
      auth: {
        user: config.email,
        pass: config.password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    };
  } else if (config.service === 'outlook') {
    transportConfig = {
      host: 'smtp-mail.outlook.com',
      port: 587, // Outlook typically uses 587
      secure: false,
      auth: {
        user: config.email,
        pass: config.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    };
  } else if (config.service === 'yahoo') {
    transportConfig = {
      host: 'smtp.mail.yahoo.com',
      port: 465,
      secure: true,
      auth: {
        user: config.email,
        pass: config.password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    };
  } else {
    // Fallback for custom or unknown services
    transportConfig = {
      host: `smtp.${config.service}.com`,
      port: 465,
      secure: true,
      auth: {
        user: config.email,
        pass: config.password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    };
  }

  console.log(`📬 Creating transporter for ${config.service} using ${transportConfig.host}:${transportConfig.port} (${transportConfig.secure ? 'SSL' : 'TLS'})`);

  return nodemailer.createTransport(transportConfig);
};
