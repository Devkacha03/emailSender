import Email from "../models/emailConfig.js";
import { globalErrorHandler } from "../controllers/errorsManager.js";
export const emailConfig = async (req, res, next) => {
  try {
    const uniqueId = req.user._id;

    const configs = await Email.findOne({ userId: uniqueId })
      .select("-createdAt -updatedAt -__v")
      .lean();

    if (!configs)
      return globalErrorHandler(
        res,
        400,
        "Please configure email settings first"
      );

    req.user = configs;
    next();
  } catch (error) {
    console.error("config middleware error: ", error.message);
    return globalErrorHandler(res, 500);
  }
};
