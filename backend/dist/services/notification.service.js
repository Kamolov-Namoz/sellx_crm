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
    // Chat xabari uchun notification
    async notifyChatMessage(data) {
        // Loyihadagi barcha ishtirokchilarni topish
        const tasks = await models_1.ProjectTask.find({
            projectId: new mongoose_1.Types.ObjectId(data.projectId)
        }).populate('developerId', '_id');
        // Unique developer IDs
        const developerIds = [...new Set(tasks
                .filter(t => t.developerId)
                .map(t => t.developerId._id.toString()))];
        // Agar sender developer bo'lsa, seller ga notification
        // Agar sender seller bo'lsa, developerlarga notification
        if (data.senderRole === 'developer') {
            // Seller ga notification - loyiha egasini topish kerak
            // Bu yerda Order modelidan userId ni olish kerak
            const { Order } = await Promise.resolve().then(() => __importStar(require('../models')));
            const order = await Order.findById(data.projectId);
            if (order && order.userId.toString() !== data.senderId) {
                await this.create({
                    userId: order.userId.toString(),
                    type: 'chat_message',
                    title: `${data.senderName} xabar yubordi`,
                    message: `${data.projectTitle}: ${data.messagePreview.substring(0, 50)}...`,
                    data: {
                        projectId: data.projectId,
                        senderId: data.senderId,
                        senderName: data.senderName,
                    },
                });
            }
        }
        else {
            // Developerlarga notification
            for (const devId of developerIds) {
                if (devId !== data.senderId) {
                    await this.create({
                        userId: devId,
                        type: 'chat_message',
                        title: `${data.senderName} xabar yubordi`,
                        message: `${data.projectTitle}: ${data.messagePreview.substring(0, 50)}...`,
                        data: {
                            projectId: data.projectId,
                            senderId: data.senderId,
                            senderName: data.senderName,
                        },
                    });
                }
            }
        }
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