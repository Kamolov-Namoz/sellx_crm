import { Request } from 'express';
import { Types } from 'mongoose';
export type UserRole = 'admin' | 'user';
export type ClientStatus = 'new' | 'thinking' | 'agreed' | 'rejected' | 'callback';
export type OrderStatus = 'new' | 'in_progress' | 'completed';
export type ConversationType = 'text' | 'audio' | 'image' | 'video';
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
export interface IOrder {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    clientId: Types.ObjectId;
    title: string;
    description?: string;
    amount?: number;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}
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
export interface IScheduledReminder {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    clientId: Types.ObjectId;
    scheduledTime: Date;
    status: 'pending' | 'sent' | 'cancelled';
    createdAt: Date;
}
export interface RegisterRequest {
    firstName: string;
    lastName: string;
    username: string;
    phoneNumber: string;
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
    role?: UserRole;
}
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
export interface CreateOrderRequest {
    clientId: string;
    title: string;
    description?: string;
    amount?: number;
    status?: OrderStatus;
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
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: Record<string, string[]>;
    };
}
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        username: string;
        role: UserRole;
    };
}
export interface JwtPayload {
    userId: string;
    username: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=index.d.ts.map