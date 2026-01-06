"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
class NotificationService {
    // Notification yaratish
    async create(data) {
        const notification = new models_1.Notification({
            userId: new mongoose_1.Types.ObjectId(data.userId),
            type: data.type,
            title: data.title,
            message: data.message,
            data: data.data,
        });
        return notification.save();
    }
    // User notificationlarini olish
    async getByUser(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            models_1.Notification.find({ userId: new mongoose_1.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            models_1.Notification.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId) }),
            models_1.Notification.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId), isRead: false }),
        ]);
        return {
            notifications,
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    // O'qilmagan notificationlar soni
    async getUnreadCount(userId) {
        return models_1.Notification.countDocuments({
            userId: new mongoose_1.Types.ObjectId(userId),
            isRead: false
        });
    }
    // Notificationni o'qilgan deb belgilash
    async markAsRead(notificationId, userId) {
        return models_1.Notification.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(notificationId),
            userId: new mongoose_1.Types.ObjectId(userId)
        }, { isRead: true, readAt: new Date() }, { new: true });
    }
    // Barcha notificationlarni o'qilgan deb belgilash
    async markAllAsRead(userId) {
        return models_1.Notification.updateMany({ userId: new mongoose_1.Types.ObjectId(userId), isRead: false }, { isRead: true, readAt: new Date() });
    }
    // Yangi vazifa uchun notification
    async notifyNewTask(data) {
        await this.create({
            userId: data.developerId,
            type: 'new_task',
            title: 'Yangi vazifa',
            message: `${data.projectTitle}: ${data.taskTitle}`,
            data: {
                projectId: data.projectId,
                taskId: data.taskId,
                senderName: data.assignedBy,
            },
        });
    }
    // Vazifa tasdiqlanganda notification
    async notifyTaskCompleted(data) {
        await this.create({
            userId: data.sellerId,
            type: 'task_completed',
            title: 'Vazifa bajarildi',
            message: `${data.developerName} "${data.taskTitle}" vazifasini bajardi`,
            data: {
                projectId: data.projectId,
                taskId: data.taskId,
                senderId: data.developerId,
                senderName: data.developerName,
            },
        });
    }
    // FCM token registration (Web Push uchun)
    async registerToken(userId, token) {
        await models_1.User.updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $addToSet: { fcmTokens: token } });
    }
    async removeToken(userId, token) {
        await models_1.User.updateOne({ _id: new mongoose_1.Types.ObjectId(userId) }, { $pull: { fcmTokens: token } });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map