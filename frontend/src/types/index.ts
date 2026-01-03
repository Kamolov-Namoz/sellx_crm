// Client status type
export type ClientStatus = 'interested' | 'thinking' | 'callback' | 'not_interested' | 'deal_closed';

// Conversation type
export type ConversationType = 'text' | 'audio' | 'image' | 'video';

// User type
export interface User {
  userId: string;
  username: string;
}

// Client type
export interface Client {
  _id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  location: string;
  brandName?: string;
  notes?: string;
  status: ClientStatus;
  followUpDate?: string;
  lastConversationSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// Conversation type
export interface Conversation {
  _id: string;
  clientId: string;
  userId: string;
  type: ConversationType;
  content: string;
  summary: string;
  nextFollowUpDate: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    mimeType?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  userId?: string;
  message?: string;
}

// Client form data
export interface ClientFormData {
  fullName: string;
  phoneNumber: string;
  location: string;
  brandName?: string;
  notes?: string;
  status: ClientStatus;
  followUpDate?: string;
}

// Conversation form data
export interface ConversationFormData {
  clientId: string;
  type: ConversationType;
  content: string;
  summary: string;
  nextFollowUpDate: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    mimeType?: string;
  };
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ClientsResponse {
  success: boolean;
  data: Client[];
  meta: {
    total: number;
    filters: {
      status: ClientStatus | null;
      sortBy: string;
      sortOrder: string;
    };
  };
}

// Status badge colors
export const STATUS_COLORS: Record<ClientStatus, string> = {
  interested: 'bg-blue-100 text-blue-800',
  thinking: 'bg-yellow-100 text-yellow-800',
  callback: 'bg-purple-100 text-purple-800',
  not_interested: 'bg-red-100 text-red-800',
  deal_closed: 'bg-green-100 text-green-800',
};

// Status labels (Uzbek)
export const STATUS_LABELS: Record<ClientStatus, string> = {
  interested: 'Qiziqgan',
  thinking: 'O\'ylayapti',
  callback: 'Qayta qo\'ng\'iroq',
  not_interested: 'Qiziqmagan',
  deal_closed: 'Bitim yopildi',
};

// Conversation type labels
export const CONVERSATION_TYPE_LABELS: Record<ConversationType, string> = {
  text: 'Matn',
  audio: 'Audio',
  image: 'Rasm',
  video: 'Video',
};
