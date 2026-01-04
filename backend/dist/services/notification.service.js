"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
// Backend Notification Service (Firebase'siz - Web Push uchun tayyorlangan)
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
class NotificationService {
    /**
     * Register push subscription for a user (Web Push uchun)
     */
    async registerToken(userId, token) {
        await models_1.User.updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $addToSet: { fcmTokens: token } });
    }
    /**
     * Remove push subscription for a user
     */
    async removeToken(userId, token) {
        await models_1.User.updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $pull: { fcmTokens: token } });
    }
    /**
     * Send follow-up notification (placeholder - frontend handles this now)
     */
    async sendFollowUpNotification(userId, _tokens, data) {
        // Web Push notification - frontend'da browser notification ishlatiladi
        console.log(`Follow-up reminder for user ${userId}: ${data.clientName}`);
        return {
            success: true,
            message: 'Notification logged - frontend handles browser notifications',
            data
        };
    }
    /**
     * Send custom notification (placeholder)
     */
    async sendNotification(_tokens, title, body, _data) {
        console.log(`Notification: ${title} - ${body}`);
        return {
            success: true,
            message: 'Notification logged - frontend handles browser notifications'
        };
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map