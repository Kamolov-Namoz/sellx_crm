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
     * Update milestone details (title, amount, percentage, dueDate, tasks)
     */
    updateMilestone(userId: string, orderId: string, milestoneId: string, data: {
        title?: string;
        description?: string;
        amount?: number;
        percentage?: number;
        dueDate?: string | null;
        tasks?: string[];
    }): Promise<import("../models").OrderDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Delete milestone
     */
    deleteMilestone(userId: string, orderId: string, milestoneId: string): Promise<import("../models").OrderDocument & Required<{
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
    /**
     * Add developer to project team
     */
    addTeamMember(userId: string, orderId: string, developerId: string, role?: 'developer' | 'team_lead'): Promise<(mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Remove developer from project team
     */
    removeTeamMember(userId: string, orderId: string, developerId: string): Promise<(mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Set team lead for project
     */
    setTeamLead(userId: string, orderId: string, developerId: string): Promise<(mongoose.FlattenMaps<import("../models").OrderDocument> & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Get project team
     */
    getTeam(orderId: string): Promise<{
        team: mongoose.FlattenMaps<import("../models/order.model").ITeamMember>[];
        teamLead: mongoose.Types.ObjectId | undefined;
    }>;
}
export declare const orderService: OrderService;
//# sourceMappingURL=order.service.d.ts.map