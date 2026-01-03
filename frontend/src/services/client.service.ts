import api from './api';
import { Client, ClientFormData, ClientsResponse, ApiResponse, ClientStatus } from '@/types';

export interface GetClientsParams {
  status?: ClientStatus;
  sortBy?: 'followUpDate' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface Stats {
  totalClients: number;
  todayFollowUps: number;
  byStatus: Record<string, number>;
}

export const clientService = {
  async getStats(): Promise<ApiResponse<Stats>> {
    const response = await api.get<ApiResponse<Stats>>('/clients/stats');
    return response.data;
  },

  async getClients(params?: GetClientsParams): Promise<ClientsResponse> {
    const response = await api.get<ClientsResponse>('/clients', { params });
    return response.data;
  },

  async getClient(id: string): Promise<ApiResponse<Client>> {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data;
  },

  async createClient(data: ClientFormData): Promise<ApiResponse<Client>> {
    // Remove empty optional fields
    const cleanData: Record<string, unknown> = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      location: data.location,
      status: data.status,
    };
    if (data.brandName) cleanData.brandName = data.brandName;
    if (data.notes) cleanData.notes = data.notes;
    if (data.followUpDate) cleanData.followUpDate = new Date(data.followUpDate).toISOString();
    
    const response = await api.post<ApiResponse<Client>>('/clients', cleanData);
    return response.data;
  },

  async updateClient(id: string, data: Partial<ClientFormData>): Promise<ApiResponse<Client>> {
    // Remove empty optional fields
    const cleanData: Record<string, unknown> = {};
    if (data.fullName) cleanData.fullName = data.fullName;
    if (data.phoneNumber) cleanData.phoneNumber = data.phoneNumber;
    if (data.location) cleanData.location = data.location;
    if (data.brandName) cleanData.brandName = data.brandName;
    if (data.status) cleanData.status = data.status;
    if (data.notes) cleanData.notes = data.notes;
    if (data.followUpDate) cleanData.followUpDate = new Date(data.followUpDate).toISOString();
    
    const response = await api.put<ApiResponse<Client>>(`/clients/${id}`, cleanData);
    return response.data;
  },

  async deleteClient(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/clients/${id}`);
    return response.data;
  },
};

export default clientService;
