// User role type
export type UserRole = 'admin' | 'user';

// Client status type
export type ClientStatus = 'new' | 'thinking' | 'agreed' | 'rejected' | 'callback';

// Order status type
export type OrderStatus = 'new' | 'in_progress' | 'completed';

// Conversation type
export type ConversationType = 'text' | 'audio' | 'image' | 'video';

// User type
export interface User {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: UserRole;
}

// Location type
export interface Location {
  address?: string;
  latitude: number;
  longitude: number;
}

// Client type
export interface Client {
  _id: string;
  userId: string;
  fullName?: string;
  companyName?: string;
  phoneNumber: string;
  location: Location;
  notes?: string;
  status: ClientStatus;
  followUpDate?: string;
  lastConversationSummary?: string;
  createdAt: string;
  updatedAt: string;
}

// Order type
export interface Order {
  _id: string;
  userId: string;
  clientId: string | Client;
  title: string;
  description?: string;
  amount?: number;
  status: OrderStatus;
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
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  expiresIn?: number;
  userId?: string;
  role?: UserRole;
  message?: string;
}

// Client form data
export interface ClientFormData {
  fullName?: string;
  companyName?: string;
  phoneNumber: string;
  location: Location;
  notes?: string;
  status?: ClientStatus;
  followUpDate?: string;
}

// Order form data
export interface OrderFormData {
  clientId: string;
  title: string;
  description?: string;
  amount?: number;
  status?: OrderStatus;
}

// Conversation form data
export interface ConversationFormData {
  clientId: string;
  type: ConversationType;
  content: string;
  summary: string;
  nextFollowUpDate?: string;
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

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Status badge colors
export const STATUS_COLORS: Record<ClientStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  thinking: 'bg-yellow-100 text-yellow-800',
  agreed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  callback: 'bg-purple-100 text-purple-800',
};

// Status labels (Uzbek)
export const STATUS_LABELS: Record<ClientStatus, string> = {
  new: 'Yangi',
  thinking: "O'ylab ko'raman",
  agreed: 'Roziman',
  rejected: 'Rad etdi',
  callback: 'Keyinroq bog\'lanish',
};

// Order status colors
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
};

// Order status labels (Uzbek)
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Yangi',
  in_progress: 'Jarayonda',
  completed: 'Tugallangan',
};

// Conversation type labels
export const CONVERSATION_TYPE_LABELS: Record<ConversationType, string> = {
  text: 'Matn',
  audio: 'Audio',
  image: 'Rasm',
  video: 'Video',
};
