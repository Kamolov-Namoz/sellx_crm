import { ApiResponse, Employee } from '@/types';
import api from './api';

export interface ProjectTask {
  _id: string;
  projectId: string;
  employeeId: string | Employee;
  title: string;
  description?: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProgress {
  tasks: ProjectTask[];
  totalTasks: number;
  completedTasks: number;
  avgProgress: number;
}

export interface CreateTaskData {
  projectId: string;
  employeeId: string;
  title: string;
  description?: string;
  dueDate?: string;
}

export const projectTaskService = {
  getByProject: async (projectId: string): Promise<ApiResponse<ProjectProgress>> => {
    const response = await api.get<ApiResponse<ProjectProgress>>(`/tasks/project/${projectId}`);
    return response.data;
  },
  
  getByEmployee: async (employeeId: string): Promise<ApiResponse<ProjectTask[]>> => {
    const response = await api.get<ApiResponse<ProjectTask[]>>(`/tasks/employee/${employeeId}`);
    return response.data;
  },
  
  create: async (data: CreateTaskData): Promise<ApiResponse<ProjectTask>> => {
    const response = await api.post<ApiResponse<ProjectTask>>('/tasks', data);
    return response.data;
  },
  
  update: async (id: string, data: Partial<{ title: string; description: string; progress: number; status: string }>): Promise<ApiResponse<ProjectTask>> => {
    const response = await api.put<ApiResponse<ProjectTask>>(`/tasks/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${id}`);
    return response.data;
  },
};
