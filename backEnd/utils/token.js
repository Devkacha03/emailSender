import jwt from "jsonwebtoken";

export const regGenerateToken = (uniqueid) => {
  try {
    return jwt.sign({ id: uniqueid }, process.env.ACCESS_JWT_SECRET, {
      expiresIn: process.env.JWT_TOKEN_EXPIRY,
    });
  } catch (error) {
    console.error("Error generating token:", error.message);
  }
};
