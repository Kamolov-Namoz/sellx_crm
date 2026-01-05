import { ApiResponse, Employee } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const employeeService = {
  // Barcha dasturchilarni olish
  async getEmployees(): Promise<ApiResponse<Employee[]>> {
    const response = await fetch(`${API_URL}/employees`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },

  // Bitta dasturchini olish
  async getEmployee(id: string): Promise<ApiResponse<Employee>> {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.json();
  },
};
