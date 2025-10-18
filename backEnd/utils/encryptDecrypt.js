import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = process.env.PASSWORDALGORITHM;
const password = process.env.PASSOWRDUNIQUEKEY;
const key = crypto.scryptSync(password, "salt", 32); // 256-bit key

export function encrypt(text) {
  const iv = crypto.randomBytes(16); // 🔁 Random 36-byte IV

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");

  encrypted += cipher.final("hex");

  // Return IV + encrypted data (hex-encoded)
  const ivHex = iv.toString("hex");
  return ivHex + ":" + encrypted;
}

export function decrypt(encryptedText) {
  const [ivHex, encryptedData] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
