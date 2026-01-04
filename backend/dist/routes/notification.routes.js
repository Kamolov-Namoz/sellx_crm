"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const notification_service_1 = require("../services/notification.service");
const router = (0, express_1.Router)();
// Apply auth middleware
router.use(auth_middleware_1.authMiddleware);
// Validation middleware
const validateRequest = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach((error) => {
            if (error.type === 'field') {
                const field = error.path;
                if (!details[field]) {
                    details[field] = [];
                }
                details[field].push(error.msg);
            }
        });
        throw new error_middleware_1.AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
    }
    next();
};
/**
 * POST /api/notifications/subscribe
 * Register FCM token for push notifications
 */
router.post('/subscribe', (0, express_validator_1.body)('deviceToken').notEmpty().withMessage('Device token is required'), validateRequest, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { deviceToken } = req.body;
        await notification_service_1.notificationService.registerToken(userId, deviceToken);
        res.json({
            success: true,
            message: 'Device registered for notifications',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/notifications/unsubscribe
 * Remove FCM token
 */
router.delete('/unsubscribe', (0, express_validator_1.body)('deviceToken').notEmpty().withMessage('Device token is required'), validateRequest, async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { deviceToken } = req.body;
        await notification_service_1.notificationService.removeToken(userId, deviceToken);
        res.json({
            success: true,
            message: 'Device unregistered from notifications',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/notifications/test
 * Send test notification (for development)
 */
router.post('/test', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        // Get user's tokens
        const { User } = await Promise.resolve().then(() => __importStar(require('../models')));
        const user = await User.findById(userId);
        if (!user || user.fcmTokens.length === 0) {
            res.json({
                success: false,
                message: 'No registered devices found',
            });
            return;
        }
        const result = await notification_service_1.notificationService.sendNotification(user.fcmTokens, 'Test bildirishnoma', 'Bu test bildirishnomasi', { action: 'test' });
        res.json({
            success: true,
            result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map