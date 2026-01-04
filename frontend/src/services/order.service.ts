import api from './api';
import { Order, OrderFormData, ApiResponse, OrderStatus, PaginatedResponse } from '@/types';

export interface GetOrdersParams {
  status?: OrderStatus;
  clientId?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderStats {
  new: { count: number; totalAmount: number };
  in_progress: { count: number; totalAmount: number };
  completed: { count: number; totalAmount: number };
}

export const orderService = {
  async getStats(): Promise<ApiResponse<OrderStats>> {
    const response = await api.get<ApiResponse<OrderStats>>('/orders/stats');
    return response.data;
  },

  async getOrders(params?: GetOrdersParams): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>('/orders', { params });
    return response.data;
  },

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  },

  async createOrder(data: OrderFormData): Promise<ApiResponse<Order>> {
    const response = await api.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  },

  async updateOrder(id: string, data: Partial<OrderFormData>): Promise<ApiResponse<Order>> {
    const response = await api.put<ApiResponse<Order>>(`/orders/${id}`, data);
    return response.data;
  },

  async deleteOrder(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/orders/${id}`);
    return response.data;
  },
};

export default orderService;
