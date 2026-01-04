import api from './api';
import { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
        const message = axiosError.response?.data?.message || 'Login failed';
        throw new Error(message);
      }
      throw error;
    }
  },

  async register(credentials: Omit<RegisterCredentials, 'confirmPassword'>): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        username: credentials.username,
        phoneNumber: credentials.phoneNumber,
        password: credentials.password,
      });
      return response.data;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
        const message = axiosError.response?.data?.message || 'Registration failed';
        throw new Error(message);
      }
      throw error;
    }
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export default authService;
