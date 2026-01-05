import { ApiResponse } from '@/types';
import api from './api';

export interface TaskAttachment {
  type: 'audio' | 'video' | 'image';
  url: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  mimeType?: string;
}

export interface ProjectTask {
  _id: string;
  projectId: {
    _id: string;
    title: string;
    status: string;
    amount?: number;
    description?: string;
    createdAt?: string;
    clientId?: {
      _id: string;
      fullName?: string;
      companyName?: string;
      phoneNumber?: string;
    };
  };
  milestoneId?: string;
  developerId: string | {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  title: string;
  description?: string;
  attachments?: TaskAttachment[];
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  isAccepted: boolean;
  acceptedAt?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  avgProgress: number;
  totalProjects: number;
  completedProjects: number;
}

export interface DeveloperProject {
  _id: string;
  title: string;
  status: string;
  amount?: number;
  description?: string;
  progress?: number;
  createdAt: string;
  clientId?: {
    fullName?: string;
    companyName?: string;
  };
  myTasks: number;
  completedTasks: number;
  myProgress: number;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  description?: string;
  project: {
    _id: string;
    title: string;
    status: string;
    clientId?: {
      fullName?: string;
      companyName?: string;
    };
  };
  completedAt: string;
  daysToComplete: number;
  createdAt: string;
}

export interface ProjectProgress {
  tasks: ProjectTask[];
  totalTasks: number;
  completedTasks: number;
  avgProgress: number;
}

export interface MilestoneProgress {
  tasks: ProjectTask[];
  totalTasks: number;
  completedTasks: number;
  avgProgress: number;
  developers: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber?: string;
  }[];
}

export interface CreateTaskData {
  projectId: string;
  milestoneId?: string;
  developerId: string;
  title: string;
  description?: string;
  attachments?: TaskAttachment[];
  dueDate?: string;
}

export const projectTaskService = {
  // Loyihaning vazifalari
  getByProject: async (projectId: string): Promise<ApiResponse<ProjectProgress>> => {
    const response = await api.get<ApiResponse<ProjectProgress>>(`/tasks/project/${projectId}`);
    return response.data;
  },
  
  // Bosqich (milestone) bo'yicha vazifalar
  getByMilestone: async (projectId: string, milestoneId: string): Promise<ApiResponse<MilestoneProgress>> => {
    const response = await api.get<ApiResponse<MilestoneProgress>>(`/tasks/project/${projectId}/milestone/${milestoneId}`);
    return response.data;
  },
  
  // Developer o'z vazifalarini olish
  getMyTasks: async (): Promise<ApiResponse<ProjectTask[]>> => {
    const response = await api.get<ApiResponse<ProjectTask[]>>('/tasks/my-tasks');
    return response.data;
  },
  
  // Developer statistikasi
  getMyStats: async (): Promise<ApiResponse<DeveloperStats>> => {
    const response = await api.get<ApiResponse<DeveloperStats>>('/tasks/my-stats');
    return response.data;
  },
  
  // Developer loyihalari
  getMyProjects: async (): Promise<ApiResponse<DeveloperProject[]>> => {
    const response = await api.get<ApiResponse<DeveloperProject[]>>('/tasks/my-projects');
    return response.data;
  },
  
  // Developer portfolio
  getMyPortfolio: async (): Promise<ApiResponse<PortfolioItem[]>> => {
    const response = await api.get<ApiResponse<PortfolioItem[]>>('/tasks/my-portfolio');
    return response.data;
  },
  
  // Vazifani tasdiqlash (Accept)
  acceptTask: async (taskId: string): Promise<ApiResponse<ProjectTask>> => {
    const response = await api.post<ApiResponse<ProjectTask>>(`/tasks/${taskId}/accept`);
    return response.data;
  },
  
  // Dasturchining vazifalari (admin/seller uchun)
  getByDeveloper: async (developerId: string): Promise<ApiResponse<ProjectTask[]>> => {
    const response = await api.get<ApiResponse<ProjectTask[]>>(`/tasks/developer/${developerId}`);
    return response.data;
  },
  
  // Yangi vazifa yaratish
  create: async (data: CreateTaskData): Promise<ApiResponse<ProjectTask>> => {
    const response = await api.post<ApiResponse<ProjectTask>>('/tasks', data);
    return response.data;
  },
  
  // Vazifani yangilash
  update: async (id: string, data: Partial<{ title: string; description: string; progress: number; status: string }>): Promise<ApiResponse<ProjectTask>> => {
    const response = await api.put<ApiResponse<ProjectTask>>(`/tasks/${id}`, data);
    return response.data;
  },
  
  // Vazifani o'chirish
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${id}`);
    return response.data;
  },
};
