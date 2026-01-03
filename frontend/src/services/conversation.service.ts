import { ApiResponse, Conversation, ConversationFormData } from '@/types';
import api from './api';

export const conversationService = {
  async getConversations(clientId: string): Promise<ApiResponse<Conversation[]>> {
    const response = await api.get<ApiResponse<Conversation[]>>(`/conversations/${clientId}`);
    return response.data;
  },

  async createConversation(data: ConversationFormData): Promise<ApiResponse<Conversation>> {
    const response = await api.post<ApiResponse<Conversation>>('/conversations', data);
    return response.data;
  },

  async deleteConversation(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/conversations/${id}`);
    return response.data;
  },
};
