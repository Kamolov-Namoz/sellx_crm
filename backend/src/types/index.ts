import { Request } from 'express';
import { Types } from 'mongoose';

// User role enum
export type UserRole = 'admin' | 'user' | 'developer';

// Client status enum
export type ClientStatus = 'new' | 'thinking' | 'agreed' | 'rejected' | 'callback';

// Order status enum
export type OrderStatus = 'in_progress' | 'completed';

// Conversation type enum
export type ConversationType = 'text' | 'audio' | 'image' | 'video';

// User interfaces
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  passwordHash: string;
  role: UserRole;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Order interfaces
export interface IOrder {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  title: string;
  description?: string;
  amount?: number;
  status: OrderStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

// Client interfaces
export interface IClient {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName?: string;
  companyName?: string;
  phoneNumber: string;
  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  notes?: string;
  status: ClientStatus;
  followUpDate?: Date;
  lastConversationSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation interfaces
export interface IConversation {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  userId: Types.ObjectId;
  type: ConversationType;
  content: string;
  summary: string;
  nextFollowUpDate: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    mimeType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Scheduled Reminder interfaces
export interface IScheduledReminder {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  clientId: Types.ObjectId;
  scheduledTime: Date;
  status: 'pending' | 'sent' | 'cancelled';
  createdAt: Date;
}

// Auth request/response types
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  password: string;
  role?: 'user' | 'developer'; // Faqat user yoki developer tanlash mumkin
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  expiresIn?: number;
  userId?: string;
  role?: UserRole;
}

// Client request/response types
export interface CreateClientRequest {
  fullName?: string;
  companyName?: string;
  phoneNumber: string;
  location: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  notes?: string;
  status?: ClientStatus;
  followUpDate?: string;
}

export interface UpdateClientRequest {
  fullName?: string;
  companyName?: string;
  phoneNumber?: string;
  location?: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  notes?: string;
  status?: ClientStatus;
  followUpDate?: string | null;
}

// Milestone type
export interface MilestoneInput {
  title: string;
  description?: string;
  amount: number;
  percentage: number;
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'paid';
  tasks?: string[];
}

// Order request types
export interface CreateOrderRequest {
  clientId: string;
  title: string;
  description?: string;
  amount?: number;
  status?: OrderStatus;
  milestones?: MilestoneInput[];
}

export interface UpdateOrderRequest {
  title?: string;
  description?: string;
  amount?: number;
  status?: OrderStatus;
}

export interface GetOrdersQuery {
  status?: OrderStatus;
  clientId?: string;
  sortBy?: 'createdAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Conversation request types
export interface CreateConversationRequest {
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

export interface GetClientsQuery {
  status?: ClientStatus;
  sortBy?: 'followUpDate' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  search?: string;
  page?: number;
  limit?: number;
}

// API Error response
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Extended Express Request with user context
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: UserRole;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}
