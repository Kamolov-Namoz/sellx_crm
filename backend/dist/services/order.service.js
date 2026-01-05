"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const models_2 = require("../models");
const error_middleware_1 = require("../middleware/error.middleware");
class OrderService {
    /**
     * Create a new order
     */
    async createOrder(userId, data) {
        // Verify client exists and belongs to user
        const client = await models_2.Client.findOne({
            _id: data.clientId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!client) {
            throw new error_middleware_1.AppError('Client not found', 404, 'CLIENT_NOT_FOUND');
        }
        const order = new models_1.Order({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            clientId: new mongoose_1.default.Types.ObjectId(data.clientId),
            title: data.title,
            description: data.description,
            amount: data.amount,
            status: data.status || 'new',
            milestones: data.milestones || [],
            totalPaid: 0,
        });
        await order.save();
        return order.toObject();
    }
    /**
     * Get orders for a user with filters
     */
    async getOrders(userId, query) {
        const { status, clientId, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20, } = query;
        const filter = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
        };
        if (status) {
            filter.status = status;
        }
        if (clientId) {
            filter.clientId = new mongoose_1.default.Types.ObjectId(clientId);
        }
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            models_1.Order.find(filter)
                .populate('clientId', 'fullName companyName phoneNumber')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            models_1.Order.countDocuments(filter),
        ]);
        return {
            orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get single order by ID
     */
    async getOrderById(userId, orderId) {
        const order = await models_1.Order.findOne({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        })
            .populate('clientId', 'fullName companyName phoneNumber location')
            .lean();
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        return order;
    }
    /**
     * Update order
     */
    async updateOrder(userId, orderId, data) {
        const order = await models_1.Order.findOneAndUpdate({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        }, { $set: data }, { new: true, runValidators: true })
            .populate('clientId', 'fullName companyName phoneNumber')
            .lean();
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        return order;
    }
    /**
     * Delete order
     */
    async deleteOrder(userId, orderId) {
        const order = await models_1.Order.findOneAndDelete({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        return { deleted: true };
    }
    /**
     * Get order statistics for user
     */
    async getOrderStats(userId) {
        const stats = await models_1.Order.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: { $ifNull: ['$amount', 0] } },
                },
            },
        ]);
        const result = {
            new: { count: 0, totalAmount: 0 },
            in_progress: { count: 0, totalAmount: 0 },
            completed: { count: 0, totalAmount: 0 },
        };
        stats.forEach((stat) => {
            if (stat._id in result) {
                result[stat._id] = {
                    count: stat.count,
                    totalAmount: stat.totalAmount,
                };
            }
        });
        return result;
    }
    /**
     * Get all orders (Admin only)
     */
    async getAllOrders(query) {
        const { status, clientId, userId, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 20, } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (clientId)
            filter.clientId = new mongoose_1.default.Types.ObjectId(clientId);
        if (userId)
            filter.userId = new mongoose_1.default.Types.ObjectId(userId);
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            models_1.Order.find(filter)
                .populate('userId', 'firstName lastName username')
                .populate('clientId', 'fullName companyName phoneNumber')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            models_1.Order.countDocuments(filter),
        ]);
        return {
            orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Update milestone status
     */
    async updateMilestoneStatus(userId, orderId, milestoneId, status) {
        const order = await models_1.Order.findOne({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        const milestone = order.milestones?.find((m) => m._id?.toString() === milestoneId);
        if (!milestone) {
            throw new error_middleware_1.AppError('Milestone not found', 404, 'MILESTONE_NOT_FOUND');
        }
        milestone.status = status;
        if (status === 'completed') {
            milestone.completedAt = new Date();
        }
        else if (status === 'paid') {
            milestone.paidAt = new Date();
            // Update totalPaid
            const totalPaid = order.milestones
                ?.filter((m) => m.status === 'paid')
                .reduce((sum, m) => sum + m.amount, 0) || 0;
            order.totalPaid = totalPaid + milestone.amount;
        }
        // Update order progress based on milestones
        if (order.milestones && order.milestones.length > 0) {
            const completedOrPaid = order.milestones.filter((m) => m.status === 'completed' || m.status === 'paid').length;
            order.progress = Math.round((completedOrPaid / order.milestones.length) * 100);
        }
        await order.save();
        return order.toObject();
    }
    /**
     * Get order with milestones for developer view
     */
    async getOrderForDeveloper(orderId) {
        const order = await models_1.Order.findById(orderId)
            .populate('clientId', 'fullName companyName phoneNumber')
            .populate('userId', 'firstName lastName username')
            .lean();
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        return order;
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
//# sourceMappingURL=order.service.js.map