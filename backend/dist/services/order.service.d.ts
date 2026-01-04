import { CreateOrderRequest, UpdateOrderRequest, GetOrdersQuery, OrderStatus } from '../types';
export declare class OrderService {
    /**
     * Create a new order
     */
    createOrder(userId: string, data: CreateOrderRequest): Promise<any>;
    /**
     * Get orders for a user with filters
     */
    getOrders(userId: string, query: GetOrdersQuery): Promise<{
        orders: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Get single order by ID
     */
    getOrderById(userId: string, orderId: string): Promise<any>;
    /**
     * Update order
     */
    updateOrder(userId: string, orderId: string, data: UpdateOrderRequest): Promise<any>;
    /**
     * Delete order
     */
    deleteOrder(userId: string, orderId: string): Promise<{
        deleted: boolean;
    }>;
    /**
     * Get order statistics for user
     */
    getOrderStats(userId: string): Promise<Record<OrderStatus, {
        count: number;
        totalAmount: number;
    }>>;
    /**
     * Get all orders (Admin only)
     */
    getAllOrders(query: GetOrdersQuery & {
        userId?: string;
    }): Promise<{
        orders: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
export declare const orderService: OrderService;
//# sourceMappingURL=order.service.d.ts.map