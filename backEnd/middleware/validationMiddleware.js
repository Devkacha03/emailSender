import joi from "joi";
import { globalErrorHandler } from "../controllers/errorsManager.js";
import sanitizeHtml from "sanitize-html";

function globalValidationMiddleware(dataSchema, req, res, next) {
  const { error } = dataSchema.validate(req.body);

  if (error) return globalErrorHandler(res, 400, error.details[0].message);

  next();
}

export const regValidationMiddleware = (req, res, next) => {
  const userSchema = joi.object({
    userName: joi.string().alphanum().min(3).max(30).required(),
    userEmail: joi.string().email().required(),
    userPassword: joi.string().min(8).required(),
  });

  globalValidationMiddleware(userSchema, req, res, next);
};
export const loginValidationMiddleware = (req, res, next) => {
  const userSchema = joi.object({
    userEmail: joi.string().email().required(),
    userPassword: joi.string().min(8).required(),
  });

  globalValidationMiddleware(userSchema, req, res, next);
};

export const serviceValidationMiddleware = (req, res, next) => {
  const serviceSchema = joi.object({
    service: joi.string().alphanum().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  globalValidationMiddleware(serviceSchema, req, res, next);
};
