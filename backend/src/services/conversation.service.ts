import { Conversation, ConversationDocument, IConversation } from '../models/conversation.model';
import { Client } from '../models/client.model';
import { ScheduledReminder } from '../models/reminder.model';
import { AppError } from '../middleware/error.middleware';
import { CreateConversationRequest } from '../types';

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
  ): Promise<ConversationDocument> {
    // Verify client belongs to user
    const client = await Client.findOne({ _id: data.clientId, userId });
    if (!client) {
      throw new AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
    }

    const nextFollowUpDate = data.nextFollowUpDate ? new Date(data.nextFollowUpDate) : undefined;

    const conversation = new Conversation({
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
    const updateData: { lastConversationSummary: string; followUpDate?: Date } = {
      lastConversationSummary: data.summary,
    };

    // Only update followUpDate if provided
    if (nextFollowUpDate) {
      updateData.followUpDate = nextFollowUpDate;

      // Cancel existing pending reminders and create new one
      await ScheduledReminder.updateMany(
        { clientId: data.clientId, status: 'pending' },
        { status: 'cancelled' }
      );
      
      await ScheduledReminder.create({
        userId,
        clientId: data.clientId,
        scheduledTime: nextFollowUpDate,
        status: 'pending',
      });
    }

    await Client.findByIdAndUpdate(data.clientId, updateData);

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
