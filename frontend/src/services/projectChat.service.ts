import { ApiResponse } from '@/types';
import api from './api';

export interface ChatMessage {
  _id: string;
  projectId: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    role?: string;
  };
  senderRole: 'user' | 'developer';
  type: 'text' | 'audio' | 'video' | 'image' | 'task';
  content: string;
  taskId?: {
    _id: string;
    title: string;
    status: string;
    isAccepted: boolean;
  };
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    mimeType?: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface TaskAttachment {
  type: 'audio' | 'video' | 'image';
  url: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  mimeType?: string;
}

export interface ProjectMilestone {
  _id: string;
  title: string;
  description?: string;
  amount: number;
  percentage: number;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  completedAt?: string;
  paidAt?: string;
  tasks?: string[];
}

export interface ProjectInfo {
  _id: string;
  title: string;
  description?: string;
  status: string;
  amount?: number;
  progress: number;
  milestones?: ProjectMilestone[];
  totalPaid?: number;
  clientId?: {
    fullName?: string;
    companyName?: string;
  };
  userId?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  team?: Array<{
    developerId: {
      _id: string;
      firstName: string;
      lastName: string;
      username: string;
    };
    addedAt: string;
  }>;
  teamLeadId?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  tasks: Array<{
    _id: string;
    title: string;
    description?: string;
    status: string;
    isAccepted: boolean;
    attachments?: TaskAttachment[];
    developerId?: {
      _id: string;
      firstName: string;
      lastName: string;
      username: string;
    };
    milestoneId?: string;
  }>;
  developers: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  }>;
  totalTasks: number;
  completedTasks: number;
  isTeamLead?: boolean;
  isSeller?: boolean;
  canManageTasks?: boolean;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  totalPages: number;
}

export const projectChatService = {
  // Xabarlarni olish
  getMessages: async (projectId: string, page = 1): Promise<ApiResponse<MessagesResponse>> => {
    const response = await api.get<ApiResponse<MessagesResponse>>(
      `/project-chat/${projectId}/messages?page=${page}`
    );
    return response.data;
  },

  // Xabar yuborish
  sendMessage: async (
    projectId: string,
    data: {
      type: 'text' | 'audio' | 'video' | 'image' | 'task';
      content: string;
      taskId?: string;
      metadata?: {
        fileName?: string;
        fileSize?: number;
        duration?: number;
        mimeType?: string;
      };
    }
  ): Promise<ApiResponse<ChatMessage>> => {
    const response = await api.post<ApiResponse<ChatMessage>>(
      `/project-chat/${projectId}/messages`,
      data
    );
    return response.data;
  },

  // Loyiha ma'lumotlari
  getProjectInfo: async (projectId: string): Promise<ApiResponse<ProjectInfo>> => {
    const response = await api.get<ApiResponse<ProjectInfo>>(
      `/project-chat/${projectId}/info`
    );
    return response.data;
  },

  // O'qilmagan xabarlar soni
  getUnreadCount: async (projectId: string): Promise<ApiResponse<{ count: number }>> => {
    const response = await api.get<ApiResponse<{ count: number }>>(
      `/project-chat/${projectId}/unread`
    );
    return response.data;
  },

  // Developer uchun barcha o'qilmagan
  getDeveloperUnreadAll: async (): Promise<ApiResponse<Array<{ _id: string; count: number }>>> => {
    const response = await api.get<ApiResponse<Array<{ _id: string; count: number }>>>(
      '/project-chat/developer/unread-all'
    );
    return response.data;
  },
};
