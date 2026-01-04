import { CreateClientRequest, UpdateClientRequest, GetClientsQuery, ClientStatus } from '../types';
export declare class ClientService {
    /**
     * Get all clients for a user with filtering, sorting, search and pagination
     */
    getClients(userId: string, query: GetClientsQuery): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
            hasMore: boolean;
            filters: {
                status: ClientStatus | null;
                search: string | null;
                sortBy: "createdAt" | "followUpDate" | "name";
                sortOrder: "asc" | "desc";
            };
        };
    }>;
    /**
     * Get dashboard statistics
     */
    getStats(userId: string): Promise<{
        totalClients: any;
        todayFollowUps: any;
        byStatus: Record<string, number>;
        orders: Record<string, {
            count: number;
            totalAmount: number;
        }>;
    }>;
    /**
     * Get single client by ID
     */
    getClient(userId: string, clientId: string): Promise<any>;
    /**
     * Create new client
     */
    createClient(userId: string, data: CreateClientRequest): Promise<any>;
    /**
     * Update client
     */
    updateClient(userId: string, clientId: string, data: UpdateClientRequest): Promise<any>;
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