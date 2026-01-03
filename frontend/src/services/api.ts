import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { offlineQueue } from './offlineQueue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors and offline queue
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 - unauthorized
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
      }
      return Promise.reject(error);
    }

    // Handle network errors - queue for offline sync
    if (!error.response && originalRequest) {
      const method = originalRequest.method?.toUpperCase();
      
      // Only queue mutation requests (POST, PUT, DELETE)
      if (method && ['POST', 'PUT', 'DELETE'].includes(method)) {
        try {
          await offlineQueue.addToQueue({
            url: `${API_BASE_URL}${originalRequest.url}`,
            method,
            data: originalRequest.data ? JSON.parse(originalRequest.data as string) : undefined,
          });
          
          // Return a fake success response for offline mode
          return {
            data: { 
              success: true, 
              offline: true, 
              message: 'So\'rov offline navbatga qo\'shildi' 
            },
            status: 202,
            statusText: 'Accepted',
            headers: {},
            config: originalRequest,
          };
        } catch {
          // If queueing fails, reject the original error
        }
      }
    }

    return Promise.reject(error);
  }
);

// Process offline queue when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    const result = await offlineQueue.processQueue();
    if (result.processed > 0) {
      console.log(`Offline queue processed: ${result.processed} requests synced`);
      // Dispatch custom event for UI notification
      window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: result }));
    }
  });

  // Initialize offline queue
  offlineQueue.init().catch(console.error);
}

export default api;
