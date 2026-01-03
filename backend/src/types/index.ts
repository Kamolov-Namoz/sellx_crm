import { Request } from 'express';
import { Types } from 'mongoose';

// Client status enum
export type ClientStatus = 'interested' | 'thinking' | 'callback' | 'not_interested' | 'deal_closed';

// Conversation type enum
export type ConversationType = 'text' | 'audio' | 'image' | 'video';

// User interfaces
export interface IUser {
  _id: Types.ObjectId;
  username: string;
  passwordHash: string;
  fcmTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Client interfaces
export interface IClient {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  phoneNumber: string;
  location: string;
  brandName?: string;
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
  username: string;
  password: string;
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
}

// Client request/response types
export interface CreateClientRequest {
  fullName: string;
  phoneNumber: string;
  location: string;
  brandName?: string;
  notes?: string;
  status: ClientStatus;
  followUpDate?: string;
}

export interface UpdateClientRequest {
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  brandName?: string;
  notes?: string;
  status?: ClientStatus;
  followUpDate?: string;
}

// Conversation request types
export interface CreateConversationRequest {
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
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}
