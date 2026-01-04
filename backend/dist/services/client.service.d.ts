import { Types } from 'mongoose';
import { CreateClientRequest, UpdateClientRequest, GetClientsQuery, ClientStatus } from '../types';
export declare class ClientService {
    /**
     * Get all clients for a user with filtering, sorting, search and pagination
     */
    getClients(userId: string, query: GetClientsQuery): Promise<{
        data: (import("mongoose").FlattenMaps<import("../models").ClientDocument> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasMore: boolean;
            filters: {
                status: ClientStatus | null;
                search: string | null;
                sortBy: "name" | "createdAt" | "followUpDate";
                sortOrder: "asc" | "desc";
            };
        };
    }>;
    /**
     * Get dashboard statistics
     */
    getStats(userId: string): Promise<{
        totalClients: number;
        todayFollowUps: number;
        byStatus: Record<string, number>;
        orders: Record<string, {
            count: number;
            totalAmount: number;
        }>;
    }>;
    /**
     * Get single client by ID
     */
    getClient(userId: string, clientId: string): Promise<import("mongoose").FlattenMaps<import("../models").ClientDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Create new client
     */
    createClient(userId: string, data: CreateClientRequest): Promise<import("../models").ClientDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Update client
     */
    updateClient(userId: string, clientId: string, data: UpdateClientRequest): Promise<import("../models").ClientDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Delete client and associated reminders, conversations, and orders
     */
    deleteClient(userId: string, clientId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Create a reminder for a client
     */
    private createReminder;
    /**
     * Cancel all pending reminders for a client
     */
    private cancelReminder;
}
export declare const clientService: ClientService;
//# sourceMappingURL=client.service.d.ts.map