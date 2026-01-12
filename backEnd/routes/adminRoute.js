import express from "express";
import { checkUserAuth } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// Protect all admin routes
router.use(checkUserAuth);
router.use(isAdmin);

// ==================== DASHBOARD ====================
router.get("/dashboard", adminController.getDashboardStats);

// ==================== EMAIL MANAGEMENT ====================
router.get("/emails", adminController.getAllEmails);
router.get("/emails/:id", adminController.getEmailDetails);
router.delete("/emails/:id", adminController.deleteEmail);

// ==================== USER MANAGEMENT ====================
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserDetails);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/toggle-status", adminController.toggleUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// ==================== TEMPLATE MANAGEMENT ====================
router.get("/templates", adminController.getAllTemplates);
router.get("/templates/:id", adminController.getTemplateDetails);
router.post("/templates", adminController.createTemplate);
router.put("/templates/:id", adminController.updateTemplate);
router.delete("/templates/:id", adminController.deleteTemplate);

// ==================== ANALYTICS ====================
router.get("/analytics", adminController.getAnalytics);

// ==================== SETTINGS ====================
router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);

// ==================== SYSTEM MONITORING ====================
router.get("/monitoring", adminController.getSystemMonitoring);

// ==================== EMAIL QUEUE MANAGEMENT ====================
router.get("/queue", adminController.getEmailQueue);
router.post("/emails/:id/retry", adminController.retryFailedEmail);
router.patch("/queue/:id/cancel", adminController.cancelQueuedEmail);

// ==================== AUDIT LOGS ====================
router.get("/audit-logs", adminController.getAuditLogs);

// ==================== USER QUOTA MANAGEMENT ====================
router.patch("/users/:id/quota", adminController.updateUserQuota);
router.post("/users/:id/quota/reset", adminController.resetUserQuota);

// ==================== EMAIL PROVIDER TESTING ====================
router.post("/test-email-provider", adminController.testEmailProvider);

// ==================== EXPORT REPORTS ====================
router.get("/export", adminController.exportReport);

export default router;
