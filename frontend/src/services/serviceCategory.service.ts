import api from './api';
import { ApiResponse } from '@/types';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  isActive: boolean;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  services: Service[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceCalculation {
  total: number;
  services: { categoryName: string; serviceName: string; price: number }[];
}

export const serviceCategoryService = {
  // Admin: Barcha sohalarni olish
  async getAll(includeInactive = false): Promise<ApiResponse<ServiceCategory[]>> {
    const response = await api.get<ApiResponse<ServiceCategory[]>>('/service-categories', {
      params: includeInactive ? { includeInactive: 'true' } : undefined,
    });
    return response.data;
  },

  // Admin: Bitta sohani olish
  async getById(id: string): Promise<ApiResponse<ServiceCategory>> {
    const response = await api.get<ApiResponse<ServiceCategory>>(`/service-categories/${id}`);
    return response.data;
  },

  // Admin: Yangi soha yaratish
  async create(data: { name: string; description?: string; icon?: string }): Promise<ApiResponse<ServiceCategory>> {
    const response = await api.post<ApiResponse<ServiceCategory>>('/service-categories', data);
    return response.data;
  },

  // Admin: Sohani yangilash
  async update(id: string, data: { name?: string; description?: string; icon?: string; isActive?: boolean }): Promise<ApiResponse<ServiceCategory>> {
    const response = await api.put<ApiResponse<ServiceCategory>>(`/service-categories/${id}`, data);
    return response.data;
  },

  // Admin: Sohani o'chirish
  async delete(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(`/service-categories/${id}`);
    return response.data;
  },

  // Admin: Xizmat qo'shish
  async addService(categoryId: string, data: { name: string; description?: string; price: number }): Promise<ApiResponse<ServiceCategory>> {
    const response = await api.post<ApiResponse<ServiceCategory>>(`/service-categories/${categoryId}/services`, data);
    return response.data;
  },

  // Admin: Xizmatni yangilash
  async updateService(categoryId: string, serviceId: string, data: { name?: string; description?: string; price?: number; isActive?: boolean }): Promise<ApiResponse<ServiceCategory>> {
    const response = await api.put<ApiResponse<ServiceCategory>>(`/service-categories/${categoryId}/services/${serviceId}`, data);
    return response.data;
  },

  // Admin: Xizmatni o'chirish
  async deleteService(categoryId: string, serviceId: string): Promise<ApiResponse<ServiceCategory>> {
    const response = await api.delete<ApiResponse<ServiceCategory>>(`/service-categories/${categoryId}/services/${serviceId}`);
    return response.data;
  },

  // Seller: Faol xizmatlarni olish
  async getActiveServices(): Promise<ApiResponse<ServiceCategory[]>> {
    const response = await api.get<ApiResponse<ServiceCategory[]>>('/service-categories/active');
    return response.data;
  },

  // Seller: Narxni hisoblash
  async calculatePrice(serviceIds: string[]): Promise<ApiResponse<PriceCalculation>> {
    const response = await api.post<ApiResponse<PriceCalculation>>('/service-categories/calculate-price', { serviceIds });
    return response.data;
  },
};
