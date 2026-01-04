import api from './api';
import { Client, Order, ApiResponse, PaginatedResponse, ClientStatus, OrderStatus } from '@/types';

export interface AdminUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  role: 'admin' | 'user';
  createdAt: string;
  clientCount?: number;
  orderCount?: number;
}

export interface AdminStats {
  totals: {
    users: number;
    clients: number;
    orders: number;
  };
  clientsByStatus: Array<{ _id: string; count: number }>;
  ordersByStatus: Array<{ _id: string; count: number; totalAmount: number }>;
  recentUsers: AdminUser[];
}

export interface MapClient {
  _id: string;
  fullName?: string;
  companyName?: string;
  phoneNumber: string;
  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  status: ClientStatus;
  userId: {
    firstName: string;
    lastName: string;
  };
}

export const adminService = {
  async getStats(): Promise<ApiResponse<AdminStats>> {
    const response = await api.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data;
  },

  async getUsers(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<AdminUser>> {
    const response = await api.get<PaginatedResponse<AdminUser>>('/admin/users', { params });
    return response.data;
  },

  async getUser(id: string): Promise<ApiResponse<AdminUser & { recentClients: Client[]; recentOrders: Order[] }>> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  async getClients(params?: {
    page?: number;
    limit?: number;
    status?: ClientStatus;
    userId?: string;
    search?: string;
  }): Promise<PaginatedResponse<Client & { userId: AdminUser }>> {
    const response = await api.get('/admin/clients', { params });
    return response.data;
  },

  async getClientsForMap(): Promise<ApiResponse<MapClient[]>> {
    const response = await api.get<ApiResponse<MapClient[]>>('/admin/clients/map');
    return response.data;
  },

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    userId?: string;
    clientId?: string;
  }): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>('/admin/orders', { params });
    return response.data;
  },
};

export default adminService;
