import api from './api';
import { Order, OrderFormData, ApiResponse, OrderStatus, PaginatedResponse, MilestoneStatus } from '@/types';

export interface GetOrdersParams {
  status?: OrderStatus;
  clientId?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderStats {
  in_progress: { count: number; totalAmount: number };
  completed: { count: number; totalAmount: number };
}

export interface Developer {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber?: string;
}

export interface TeamMember {
  developerId: Developer;
  role: 'developer' | 'team_lead';
  joinedAt: string;
}

export interface TeamData {
  team: TeamMember[];
  teamLead: Developer | null;
}

export const orderService = {
  async getStats(): Promise<ApiResponse<OrderStats>> {
    const response = await api.get<ApiResponse<OrderStats>>('/orders/stats');
    return response.data;
  },

  async getDevelopers(search?: string): Promise<ApiResponse<Developer[]>> {
    const response = await api.get<ApiResponse<Developer[]>>('/orders/developers', { 
      params: search ? { search } : undefined 
    });
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

  async updateMilestoneStatus(
    orderId: string,
    milestoneId: string,
    status: MilestoneStatus
  ): Promise<ApiResponse<Order>> {
    const response = await api.patch<ApiResponse<Order>>(
      `/orders/${orderId}/milestones/${milestoneId}`,
      { status }
    );
    return response.data;
  },

  async updateMilestone(
    orderId: string,
    milestoneId: string,
    data: {
      title?: string;
      description?: string;
      amount?: number;
      percentage?: number;
      dueDate?: string | null;
      tasks?: string[];
    }
  ): Promise<ApiResponse<Order>> {
    const response = await api.put<ApiResponse<Order>>(
      `/orders/${orderId}/milestones/${milestoneId}`,
      data
    );
    return response.data;
  },

  async deleteMilestone(orderId: string, milestoneId: string): Promise<ApiResponse<Order>> {
    const response = await api.delete<ApiResponse<Order>>(
      `/orders/${orderId}/milestones/${milestoneId}`
    );
    return response.data;
  },

  // ==================== TEAM MANAGEMENT ====================

  async getTeam(orderId: string): Promise<ApiResponse<TeamData>> {
    const response = await api.get<ApiResponse<TeamData>>(`/orders/${orderId}/team`);
    return response.data;
  },

  async addTeamMember(
    orderId: string,
    developerId: string,
    role: 'developer' | 'team_lead' = 'developer'
  ): Promise<ApiResponse<Order>> {
    const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/team`, {
      developerId,
      role,
    });
    return response.data;
  },

  async removeTeamMember(orderId: string, developerId: string): Promise<ApiResponse<Order>> {
    const response = await api.delete<ApiResponse<Order>>(`/orders/${orderId}/team/${developerId}`);
    return response.data;
  },

  async setTeamLead(orderId: string, developerId: string): Promise<ApiResponse<Order>> {
    const response = await api.put<ApiResponse<Order>>(`/orders/${orderId}/team/lead`, {
      developerId,
    });
    return response.data;
  },
};

export default orderService;
