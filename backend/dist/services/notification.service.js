"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const mongoose_1 = require("mongoose");
const config_1 = require("../config");
const models_1 = require("../models");
// Initialize Firebase Admin SDK
let firebaseInitialized = false;
let firebaseInitError = null;
function initializeFirebase() {
    if (firebaseInitialized)
        return;
    if (config_1.config.firebase.projectId && config_1.config.firebase.privateKey && config_1.config.firebase.clientEmail) {
        try {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert({
                    projectId: config_1.config.firebase.projectId,
                    privateKey: config_1.config.firebase.privateKey,
                    clientEmail: config_1.config.firebase.clientEmail,
                }),
            });
            firebaseInitialized = true;
            console.warn('Firebase Admin SDK initialized');
        }
        catch (error) {
            firebaseInitError = error;
            console.error('Failed to initialize Firebase:', error);
        }
    }
    else {
        console.warn('Firebase credentials not configured - push notifications disabled');
    }
}
// Initialize on module load
initializeFirebase();
class NotificationService {
    /**
     * Register FCM token for a user
     */
    async registerToken(userId, token) {
        await models_1.User.updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $addToSet: { fcmTokens: token } });
    }
    /**
     * Remove FCM token for a user
     */
    async removeToken(userId, token) {
        await models_1.User.updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $pull: { fcmTokens: token } });
    }
    /**
     * Send follow-up notification
     */
    async sendFollowUpNotification(userId, tokens, data) {
        if (!firebaseInitialized) {
            const reason = firebaseInitError ? 'init_error' : 'not_configured';
            console.warn(`Skipping notification - Firebase ${reason}`);
            return { success: false, reason };
        }
        if (tokens.length === 0) {
            console.warn('Skipping notification - no FCM tokens');
            return { success: false, reason: 'no_tokens' };
        }
        const message = {
            notification: {
                title: 'Follow-up eslatmasi',
                body: `${data.clientName} bilan bog'lanish vaqti keldi`,
            },
            data: {
                clientId: data.clientId,
                clientName: data.clientName,
                action: 'open_client',
            },
            tokens,
        };
        try {
            const response = await firebase_admin_1.default.messaging().sendEachForMulticast(message);
            // Remove invalid tokens
            if (response.failureCount > 0) {
                const invalidTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        const errorCode = resp.error?.code;
                        if (errorCode === 'messaging/invalid-registration-token' ||
                            errorCode === 'messaging/registration-token-not-registered') {
                            invalidTokens.push(tokens[idx]);
                        }
                    }
                });
                // Remove invalid tokens from user
                if (invalidTokens.length > 0) {
                    await models_1.User.updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $pull: { fcmTokens: { $in: invalidTokens } } });
                }
            }
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            console.error('Failed to send notification:', error);
            return { success: false, error };
        }
    }
    /**
     * Send custom notification
     */
    async sendNotification(tokens, title, body, data) {
        if (!firebaseInitialized) {
            return { success: false, reason: firebaseInitError ? 'init_error' : 'not_configured' };
        }
        if (tokens.length === 0) {
            return { success: false, reason: 'no_tokens' };
        }
        const message = {
            notification: { title, body },
            data: data || {},
            tokens,
        };
        try {
            const response = await firebase_admin_1.default.messaging().sendEachForMulticast(message);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            console.error('Failed to send notification:', error);
            return { success: false, error };
        }
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map