import mongoose from 'mongoose';
import { CreateOrderRequest, UpdateOrderRequest, GetOrdersQuery, OrderStatus } from '../types';
export declare class OrderService {
    /**
     * Create a new order
     */
    createOrder(userId: string, data: CreateOrderRequest): Promise<import("../models").OrderDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Get orders for a user with filters
     */
    getOrders(userId: string, query: GetOrdersQuery): Promise<{
        orders: (mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Get single order by ID
     */
    getOrderById(userId: string, orderId: string): Promise<mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Update order
     */
    updateOrder(userId: string, orderId: string, data: UpdateOrderRequest): Promise<mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
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
        orders: (mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    /**
     * Update milestone status
     */
    updateMilestoneStatus(userId: string, orderId: string, milestoneId: string, status: 'pending' | 'in_progress' | 'completed' | 'paid'): Promise<import("../models").OrderDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Get order with milestones for developer view
     */
    getOrderForDeveloper(orderId: string): Promise<mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
}
export declare const orderService: OrderService;
//# sourceMappingURL=order.service.d.ts.map