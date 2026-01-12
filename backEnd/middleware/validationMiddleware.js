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
    userName: joi.string().min(3).max(50).required(),
    userEmail: joi.string().email().required(),
    userPassword: joi.string().min(8).required(),
    userConfirmPassword: joi.string().min(8).required(),
    role: joi.string().valid('user', 'admin').optional(),
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

export const changePasswordValidatioMiddleware = (req, res, next) => {
  const passwordSchema = joi.object({
    currentPassword: joi.string().min(8).required(),
    newPassword: joi.string().min(8).required(),
    confimPassword: joi.string().min(8).required(),
  });

  globalValidationMiddleware(passwordSchema, req, res, next);
};

export const serviceValidationMiddleware = (req, res, next) => {
  const serviceSchema = joi.object({
    service: joi.string().min(3).max(30).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    host: joi.string().optional().allow(''),
    port: joi.number().optional().allow(''),
    secure: joi.boolean().optional(),
  });

  globalValidationMiddleware(serviceSchema, req, res, next);
};

export const forgotPasswordValidationMiddleware = (req, res, next) => {
  const mailSchema = joi.object({
    email: joi.string().email().required(),
  });

  globalValidationMiddleware(mailSchema, req, res, next);
};

export const setNewPasswordValidation = (req, res, next) => {
  const passSchema = joi.object({
    newPassword: joi.string().min(8).required(),
    confirmPassword: joi.string().min(8).required(),
  });

  globalValidationMiddleware(passSchema, req, res, next);
};
