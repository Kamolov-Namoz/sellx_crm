"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationService = void 0;
const conversation_model_1 = require("../models/conversation.model");
const client_model_1 = require("../models/client.model");
const reminder_model_1 = require("../models/reminder.model");
const error_middleware_1 = require("../middleware/error.middleware");
class ConversationService {
    async getConversations(userId, clientId) {
        // Verify client belongs to user
        const client = await client_model_1.Client.findOne({ _id: clientId, userId });
        if (!client) {
            throw new error_middleware_1.AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
        }
        const conversations = await conversation_model_1.Conversation.find({ clientId, userId })
            .sort({ createdAt: -1 })
            .lean();
        return conversations;
    }
    async createConversation(userId, data) {
        // Verify client belongs to user
        const client = await client_model_1.Client.findOne({ _id: data.clientId, userId });
        if (!client) {
            throw new error_middleware_1.AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
        }
        const nextFollowUpDate = data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined;
        const conversation = new conversation_model_1.Conversation({
            clientId: data.clientId,
            userId,
            type: data.type,
            content: data.content,
            summary: data.summary,
            nextFollowUpDate,
            metadata: data.metadata,
        });
        await conversation.save();
        // Update client's lastConversationSummary
        const updateData = {
            lastConversationSummary: data.summary,
        };
        // Only update followUpDate if provided
        if (nextFollowUpDate) {
            updateData.followUpDate = nextFollowUpDate;
            // Cancel existing pending reminders and create new one
            await reminder_model_1.ScheduledReminder.updateMany({ clientId: data.clientId, status: 'pending' }, { status: 'cancelled' });
            await reminder_model_1.ScheduledReminder.create({
                userId,
                clientId: data.clientId,
                scheduledTime: nextFollowUpDate,
                status: 'pending',
            });
        }
        await client_model_1.Client.findByIdAndUpdate(data.clientId, updateData);
        return conversation;
    }
    async deleteConversation(userId, conversationId) {
        const conversation = await conversation_model_1.Conversation.findOne({ _id: conversationId, userId });
        if (!conversation) {
            throw new error_middleware_1.AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
        }
        await conversation_model_1.Conversation.findByIdAndDelete(conversationId);
    }
}
exports.conversationService = new ConversationService();
//# sourceMappingURL=conversation.service.js.map