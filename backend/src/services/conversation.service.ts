import { Conversation } from '../models/conversation.model';
import { Client } from '../models/client.model';
import { ScheduledReminder } from '../models/reminder.model';
import { AppError } from '../middleware/error.middleware';
import { CreateConversationRequest, IConversation } from '../types';

class ConversationService {
  async getConversations(userId: string, clientId: string): Promise<IConversation[]> {
    // Verify client belongs to user
    const client = await Client.findOne({ _id: clientId, userId });
    if (!client) {
      throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    const conversations = await Conversation.find({ clientId, userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return conversations as IConversation[];
  }

  async createConversation(
    userId: string,
    data: CreateConversationRequest
  ): Promise<IConversation> {
    // Verify client belongs to user
    const client = await Client.findOne({ _id: data.clientId, userId });
    if (!client) {
      throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    const conversation = new Conversation({
      clientId: data.clientId,
      userId,
      type: data.type,
      content: data.content,
      summary: data.summary,
      nextFollowUpDate: new Date(data.nextFollowUpDate),
      metadata: data.metadata,
    });

    await conversation.save();

    // Update client's lastConversationSummary and followUpDate
    await Client.findByIdAndUpdate(data.clientId, {
      lastConversationSummary: data.summary,
      followUpDate: new Date(data.nextFollowUpDate),
    });

    // Create reminder for follow-up
    await ScheduledReminder.create({
      userId,
      clientId: data.clientId,
      scheduledTime: new Date(data.nextFollowUpDate),
      status: 'pending',
    });

    return conversation;
  }

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    await Conversation.findByIdAndDelete(conversationId);
  }
}

export const conversationService = new ConversationService();
