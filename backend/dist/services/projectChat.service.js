"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectChatService = exports.ProjectChatService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const notification_service_1 = require("./notification.service");
class ProjectChatService {
    // Xabar yuborish
    async sendMessage(data) {
        const message = new models_1.ProjectChat({
            projectId: new mongoose_1.Types.ObjectId(data.projectId),
            senderId: new mongoose_1.Types.ObjectId(data.senderId),
            senderRole: data.senderRole,
            type: data.type,
            content: data.content,
            taskId: data.taskId ? new mongoose_1.Types.ObjectId(data.taskId) : undefined,
            metadata: data.metadata,
        });
        await message.save();
        // Populate sender info
        const populatedMessage = await message.populate('senderId', 'firstName lastName username');
        // Notification yuborish
        try {
            const sender = populatedMessage.senderId;
            const project = await models_1.Order.findById(data.projectId).select('title');
            if (project && sender) {
                const senderName = `${sender.firstName} ${sender.lastName}`;
                const messagePreview = data.type === 'text' ? data.content :
                    data.type === 'image' ? '📷 Rasm' :
                        data.type === 'video' ? '🎥 Video' :
                            data.type === 'audio' ? '🎵 Audio' :
                                data.type === 'task' ? '📋 Vazifa' : 'Xabar';
                await notification_service_1.notificationService.notifyChatMessage({
                    projectId: data.projectId,
                    projectTitle: project.title,
                    senderId: data.senderId,
                    senderName,
                    senderRole: data.senderRole,
                    messagePreview,
                });
            }
        }
        catch (err) {
            console.error('Notification yuborishda xatolik:', err);
        }
        return populatedMessage;
    }
    // Loyiha xabarlarini olish
    async getMessages(projectId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            models_1.ProjectChat.find({ projectId: new mongoose_1.Types.ObjectId(projectId) })
                .populate('senderId', 'firstName lastName username role')
                .populate('taskId', 'title status isAccepted')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            models_1.ProjectChat.countDocuments({ projectId: new mongoose_1.Types.ObjectId(projectId) }),
        ]);
        return {
            messages: messages.reverse(), // Eng eski birinchi
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    // Xabarlarni o'qilgan deb belgilash
    async markAsRead(projectId, userId) {
        await models_1.ProjectChat.updateMany({
            projectId: new mongoose_1.Types.ObjectId(projectId),
            senderId: { $ne: new mongoose_1.Types.ObjectId(userId) },
            isRead: false,
        }, {
            isRead: true,
            readAt: new Date(),
        });
    }
    // O'qilmagan xabarlar soni
    async getUnreadCount(projectId, userId) {
        return models_1.ProjectChat.countDocuments({
            projectId: new mongoose_1.Types.ObjectId(projectId),
            senderId: { $ne: new mongoose_1.Types.ObjectId(userId) },
            isRead: false,
        });
    }
    // Developer uchun barcha loyihalardan o'qilmagan xabarlar
    async getDeveloperUnreadCounts(developerId) {
        // Developer qaysi loyihalarda ishtirok etayotganini topish
        const tasks = await models_1.ProjectTask.find({
            developerId: new mongoose_1.Types.ObjectId(developerId)
        }).distinct('projectId');
        const counts = await models_1.ProjectChat.aggregate([
            {
                $match: {
                    projectId: { $in: tasks },
                    senderId: { $ne: new mongoose_1.Types.ObjectId(developerId) },
                    isRead: false,
                },
            },
            {
                $group: {
                    _id: '$projectId',
                    count: { $sum: 1 },
                },
            },
        ]);
        return counts;
    }
    // Loyiha ma'lumotlari (chat uchun)
    async getProjectInfo(projectId) {
        const project = await models_1.Order.findById(projectId)
            .populate('clientId', 'fullName companyName')
            .populate('userId', 'firstName lastName')
            .lean();
        if (!project)
            return null;
        // Loyihadagi vazifalar va dasturchilar
        const tasks = await models_1.ProjectTask.find({ projectId: new mongoose_1.Types.ObjectId(projectId) })
            .populate('developerId', 'firstName lastName username')
            .lean();
        // Unique developers
        const developers = [...new Map(tasks
                .filter(t => t.developerId)
                .map(t => [t.developerId._id.toString(), t.developerId])).values()];
        const completedTasks = tasks.filter(t => t.isAccepted).length;
        const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        return {
            ...project,
            tasks,
            developers,
            totalTasks: tasks.length,
            completedTasks,
            progress,
        };
    }
}
exports.ProjectChatService = ProjectChatService;
exports.projectChatService = new ProjectChatService();
//# sourceMappingURL=projectChat.service.js.map