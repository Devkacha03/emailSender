import { errorMessages } from "../utils/errorMessage.js";

export const globalErrorHandler = (res, statusCode, message) => {
  statusCode = statusCode || 500;
  if (!message) message = errorMessages[statusCode] || "Unknown Error";
  return res.status(statusCode).json({ message: message, error: message });
};

export const clientTokenError = (errorName = null, error, res) => {
  switch (errorName) {
    case "TokenExpiredError": //! TOKEN EXPIRED ERROR
      globalErrorHandler(res, 401, "Token Expired");
      break;
    case "JsonWebTokenError": //! TOKEN RELATED ERROR
      globalErrorHandler(res, 401, "Not authorized, no token");
      break;
    case "SyntaxError": //! TOKEN SYNTAX ERROR
      globalErrorHandler(res, 401, "Token Invalid");
      break;
    case "TypeError": //! TypeError ERROR
      globalErrorHandler(res, 401, `Type error ${error.message}`);
      break;
    default:
      globalErrorHandler(res, 500, "Server Error During Authentication");
      break;
  }
};

export const mongooseErrorHandler = (
  res,
  error,
  errorCodeMessage,
  errorCode,
  message
) => {
  let errorName = errorCodeMessage.toString();

  switch (errorName) {
    case "11000": //! DUPLICATE KEY ERROR
      globalErrorHandler(res, 409);
      break;
    case "ValidationError": //! VALIDATION ERROR
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      globalErrorHandler(res, 400, errors);
      break;
    default:
      globalErrorHandler(res, 500);
      break;
  }
};
