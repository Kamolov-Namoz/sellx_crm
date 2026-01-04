import { ApiResponse, Employee, EmployeeFormData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const employeeService = {
  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    const response = await fetch(`${API_URL}/employees`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  async createEmployee(data: EmployeeFormData): Promise<ApiResponse<Employee>> {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<ApiResponse<Employee>> {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async deleteEmployee(id: string): Promise<ApiResponse<void>> {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
