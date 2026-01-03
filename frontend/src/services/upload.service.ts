import api from './api';

interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const uploadService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getFullUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  },
};
