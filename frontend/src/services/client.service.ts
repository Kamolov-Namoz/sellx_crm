import api from './api';
import { Client, ClientFormData, ApiResponse, ClientStatus, PaginatedResponse } from '@/types';

export interface GetClientsParams {
  status?: ClientStatus;
  sortBy?: 'followUpDate' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}

export interface Stats {
  totalClients: number;
  todayFollowUps: number;
  byStatus: Record<string, number>;
  orders?: Record<string, { count: number; totalAmount: number }>;
}

export const clientService = {
  async getStats(): Promise<ApiResponse<Stats>> {
    const response = await api.get<ApiResponse<Stats>>('/clients/stats');
    return response.data;
  },

  async getClients(params?: GetClientsParams): Promise<PaginatedResponse<Client>> {
    const response = await api.get<PaginatedResponse<Client>>('/clients', { params });
    return response.data;
  },

  async getClient(id: string): Promise<ApiResponse<Client>> {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  async createClient(data: ClientFormData): Promise<ApiResponse<Client>> {
    const cleanData: Record<string, unknown> = {
      phoneNumber: data.phoneNumber,
      location: data.location,
      status: data.status || 'new',
    };
    
    if (data.fullName) cleanData.fullName = data.fullName;
    if (data.companyName) cleanData.companyName = data.companyName;
    if (data.notes) cleanData.notes = data.notes;
    if (data.followUpDate) cleanData.followUpDate = new Date(data.followUpDate).toISOString();
    
    const response = await api.post<ApiResponse<Client>>('/clients', cleanData);
    return response.data;
  },

  async updateClient(id: string, data: Partial<ClientFormData>): Promise<ApiResponse<Client>> {
    const cleanData: Record<string, unknown> = {};
    
    if (data.fullName !== undefined) cleanData.fullName = data.fullName;
    if (data.companyName !== undefined) cleanData.companyName = data.companyName;
    if (data.phoneNumber !== undefined) cleanData.phoneNumber = data.phoneNumber;
    if (data.location !== undefined) cleanData.location = data.location;
    if (data.status !== undefined) cleanData.status = data.status;
    if (data.notes !== undefined) cleanData.notes = data.notes;
    if (data.followUpDate !== undefined) {
      cleanData.followUpDate = data.followUpDate ? new Date(data.followUpDate).toISOString() : null;
    }
    
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, cleanData);
    return response.data;
  },

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/clients/${id}`);
    return response.data;
  },
};

export default clientService;
