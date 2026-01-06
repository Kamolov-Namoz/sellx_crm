"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
            status: 'in_progress', // Loyiha yaratilganda avtomatik jarayonda
            milestones: data.milestones || [],
            totalPaid: 0,
            selectedServices: data.selectedServices || [],
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
            .populate('team.developerId', 'firstName lastName username')
            .populate('teamLeadId', 'firstName lastName username')
            .lean();
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        return order;
    }
    /**
     * Update order - status avtomatik hisoblanadi, qo'lda o'zgartirib bo'lmaydi
     */
    async updateOrder(userId, orderId, data) {
        // Status ni o'zgartirishga ruxsat bermaymiz - u avtomatik hisoblanadi
        const { status, ...safeData } = data;
        const order = await models_1.Order.findOneAndUpdate({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        }, { $set: safeData }, { new: true, runValidators: true })
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
     * Update milestone status - faqat 'paid' statusini qo'lda o'zgartirish mumkin
     * Boshqa statuslar (pending, in_progress, completed) avtomatik hisoblanadi
     */
    async updateMilestoneStatus(userId, orderId, milestoneId, status) {
        // Faqat 'paid' statusini qabul qilamiz
        if (status !== 'paid') {
            throw new error_middleware_1.AppError('Faqat to\'landi statusini belgilash mumkin', 400, 'INVALID_STATUS');
        }
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
        // Faqat completed bo'lgan bosqichni paid qilish mumkin
        if (milestone.status !== 'completed') {
            throw new error_middleware_1.AppError('Faqat bajarilgan bosqichni to\'langan deb belgilash mumkin', 400, 'MILESTONE_NOT_COMPLETED');
        }
        milestone.status = 'paid';
        milestone.paidAt = new Date();
        // totalPaid ni qayta hisoblash
        order.totalPaid = order.milestones
            ?.filter((m) => m.status === 'paid')
            .reduce((sum, m) => sum + m.amount, 0) || 0;
        await order.save();
        return order.toObject();
    }
    /**
     * Update milestone details (title, amount, percentage, dueDate, tasks)
     */
    async updateMilestone(userId, orderId, milestoneId, data) {
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
        // Update fields
        if (data.title)
            milestone.title = data.title;
        if (data.description !== undefined)
            milestone.description = data.description;
        if (data.amount !== undefined)
            milestone.amount = data.amount;
        if (data.percentage !== undefined)
            milestone.percentage = data.percentage;
        if (data.dueDate !== undefined) {
            milestone.dueDate = data.dueDate ? new Date(data.dueDate) : undefined;
        }
        if (data.tasks !== undefined)
            milestone.tasks = data.tasks;
        await order.save();
        return order.toObject();
    }
    /**
     * Delete milestone - vazifalar bo'lsa o'chirishga ruxsat bermaydi
     */
    async deleteMilestone(userId, orderId, milestoneId) {
        const order = await models_1.Order.findOne({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        // Bosqichga tegishli vazifalar bormi tekshirish
        const { ProjectTask } = await Promise.resolve().then(() => __importStar(require('../models')));
        const tasksCount = await ProjectTask.countDocuments({
            projectId: new mongoose_1.default.Types.ObjectId(orderId),
            milestoneId: new mongoose_1.default.Types.ObjectId(milestoneId),
        });
        if (tasksCount > 0) {
            throw new error_middleware_1.AppError(`Bu bosqichda ${tasksCount} ta vazifa bor. Avval vazifalarni o'chiring.`, 400, 'MILESTONE_HAS_TASKS');
        }
        order.milestones = order.milestones?.filter((m) => m._id?.toString() !== milestoneId);
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
            .populate('team.developerId', 'firstName lastName username')
            .populate('teamLeadId', 'firstName lastName username')
            .lean();
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        return order;
    }
    /**
     * Add developer to project team
     */
    async addTeamMember(userId, orderId, developerId, role = 'developer') {
        const order = await models_1.Order.findOne({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        // Check if developer already in team
        const existingMember = order.team?.find((m) => m.developerId.toString() === developerId);
        if (existingMember) {
            throw new error_middleware_1.AppError('Developer already in team', 400, 'ALREADY_IN_TEAM');
        }
        // Initialize team array if not exists
        if (!order.team) {
            order.team = [];
        }
        // Add new team member
        order.team.push({
            developerId: new mongoose_1.default.Types.ObjectId(developerId),
            role,
            joinedAt: new Date(),
        });
        // If role is team_lead, update teamLeadId
        if (role === 'team_lead') {
            order.teamLeadId = new mongoose_1.default.Types.ObjectId(developerId);
        }
        await order.save();
        // Return populated order
        return models_1.Order.findById(orderId)
            .populate('team.developerId', 'firstName lastName username')
            .populate('teamLeadId', 'firstName lastName username')
            .lean();
    }
    /**
     * Remove developer from project team
     */
    async removeTeamMember(userId, orderId, developerId) {
        const order = await models_1.Order.findOne({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        // Remove from team
        order.team = order.team?.filter((m) => m.developerId.toString() !== developerId);
        // If removed developer was team lead, clear teamLeadId
        if (order.teamLeadId?.toString() === developerId) {
            order.teamLeadId = undefined;
        }
        await order.save();
        return models_1.Order.findById(orderId)
            .populate('team.developerId', 'firstName lastName username')
            .populate('teamLeadId', 'firstName lastName username')
            .lean();
    }
    /**
     * Set team lead for project
     */
    async setTeamLead(userId, orderId, developerId) {
        const order = await models_1.Order.findOne({
            _id: orderId,
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        // Check if developer is in team
        const member = order.team?.find((m) => m.developerId.toString() === developerId);
        if (!member) {
            throw new error_middleware_1.AppError('Developer not in team', 400, 'NOT_IN_TEAM');
        }
        // Update previous team lead role to developer
        if (order.teamLeadId) {
            const prevLead = order.team?.find((m) => m.developerId.toString() === order.teamLeadId?.toString());
            if (prevLead) {
                prevLead.role = 'developer';
            }
        }
        // Set new team lead
        member.role = 'team_lead';
        order.teamLeadId = new mongoose_1.default.Types.ObjectId(developerId);
        await order.save();
        return models_1.Order.findById(orderId)
            .populate('team.developerId', 'firstName lastName username')
            .populate('teamLeadId', 'firstName lastName username')
            .lean();
    }
    /**
     * Get project team
     */
    async getTeam(orderId) {
        const order = await models_1.Order.findById(orderId)
            .populate('team.developerId', 'firstName lastName username phoneNumber')
            .populate('teamLeadId', 'firstName lastName username phoneNumber')
            .lean();
        if (!order) {
            throw new error_middleware_1.AppError('Order not found', 404, 'ORDER_NOT_FOUND');
        }
        return {
            team: order.team || [],
            teamLead: order.teamLeadId,
        };
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
//# sourceMappingURL=order.service.js.map