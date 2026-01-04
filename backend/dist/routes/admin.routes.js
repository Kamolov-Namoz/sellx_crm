"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const models_1 = require("../models");
const order_service_1 = require("../services/order.service");
const router = (0, express_1.Router)();
// Apply auth and admin middleware to all routes
router.use(auth_middleware_1.authMiddleware);
router.use(admin_middleware_1.adminMiddleware);
// Validation middleware
const validateRequest = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const details = {};
        errors.array().forEach((error) => {
            if (error.type === 'field') {
                const field = error.path;
                if (!details[field]) {
                    details[field] = [];
                }
                details[field].push(error.msg);
            }
        });
        throw new error_middleware_1.AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
    }
    next();
};
/**
 * GET /api/admin/stats
 * Get overall statistics
 */
router.get('/stats', async (_req, res, next) => {
    try {
        const [totalUsers, totalClients, totalOrders, clientsByStatus, ordersByStatus, recentUsers,] = await Promise.all([
            models_1.User.countDocuments(),
            models_1.Client.countDocuments(),
            models_1.Order.countDocuments(),
            models_1.Client.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]),
            models_1.Order.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: { $ifNull: ['$amount', 0] } },
                    },
                },
            ]),
            models_1.User.find()
                .select('firstName lastName username createdAt')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);
        res.json({
            success: true,
            data: {
                totals: {
                    users: totalUsers,
                    clients: totalClients,
                    orders: totalOrders,
                },
                clientsByStatus,
                ordersByStatus,
                recentUsers,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('search').optional().trim(),
], validateRequest, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const filter = {};
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }
        const [users, total] = await Promise.all([
            models_1.User.find(filter)
                .select('-passwordHash -fcmTokens')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            models_1.User.countDocuments(filter),
        ]);
        // Get client and order counts for each user
        const userIds = users.map((u) => u._id);
        const [clientCounts, orderCounts] = await Promise.all([
            models_1.Client.aggregate([
                { $match: { userId: { $in: userIds } } },
                { $group: { _id: '$userId', count: { $sum: 1 } } },
            ]),
            models_1.Order.aggregate([
                { $match: { userId: { $in: userIds } } },
                { $group: { _id: '$userId', count: { $sum: 1 } } },
            ]),
        ]);
        const clientCountMap = new Map(clientCounts.map((c) => [c._id.toString(), c.count]));
        const orderCountMap = new Map(orderCounts.map((o) => [o._id.toString(), o.count]));
        const usersWithCounts = users.map((user) => ({
            ...user,
            clientCount: clientCountMap.get(user._id.toString()) || 0,
            orderCount: orderCountMap.get(user._id.toString()) || 0,
        }));
        res.json({
            success: true,
            data: usersWithCounts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/users/:id
 * Get single user details
 */
router.get('/users/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Valid user ID is required'), validateRequest, async (req, res, next) => {
    try {
        const user = await models_1.User.findById(req.params.id)
            .select('-passwordHash -fcmTokens')
            .lean();
        if (!user) {
            throw new error_middleware_1.AppError('User not found', 404, 'USER_NOT_FOUND');
        }
        const [clientCount, orderCount, recentClients, recentOrders] = await Promise.all([
            models_1.Client.countDocuments({ userId: user._id }),
            models_1.Order.countDocuments({ userId: user._id }),
            models_1.Client.find({ userId: user._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            models_1.Order.find({ userId: user._id })
                .populate('clientId', 'fullName companyName')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
        ]);
        res.json({
            success: true,
            data: {
                ...user,
                clientCount,
                orderCount,
                recentClients,
                recentOrders,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/clients
 * Get all clients (all users)
 */
router.get('/clients', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['new', 'thinking', 'agreed', 'rejected', 'callback']),
    (0, express_validator_1.query)('userId').optional().isMongoId(),
    (0, express_validator_1.query)('search').optional().trim(),
], validateRequest, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const userId = req.query.userId;
        const search = req.query.search;
        const filter = {};
        if (status)
            filter.status = status;
        if (userId)
            filter.userId = new mongoose_1.default.Types.ObjectId(userId);
        if (search) {
            filter.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }
        const [clients, total] = await Promise.all([
            models_1.Client.find(filter)
                .populate('userId', 'firstName lastName username')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            models_1.Client.countDocuments(filter),
        ]);
        res.json({
            success: true,
            data: clients,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/clients/map
 * Get all clients with location for map view
 */
router.get('/clients/map', async (_req, res, next) => {
    try {
        const clients = await models_1.Client.find({
            'location.latitude': { $exists: true },
            'location.longitude': { $exists: true },
        })
            .select('fullName companyName phoneNumber location status userId')
            .populate('userId', 'firstName lastName')
            .lean();
        res.json({
            success: true,
            data: clients,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/orders
 * Get all orders (all users)
 */
router.get('/orders', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('status').optional().isIn(['new', 'in_progress', 'completed']),
    (0, express_validator_1.query)('userId').optional().isMongoId(),
    (0, express_validator_1.query)('clientId').optional().isMongoId(),
], validateRequest, async (req, res, next) => {
    try {
        const result = await order_service_1.orderService.getAllOrders({
            status: req.query.status,
            userId: req.query.userId,
            clientId: req.query.clientId,
            page: req.query.page ? parseInt(req.query.page) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined,
        });
        res.json({
            success: true,
            data: result.orders,
            meta: result.meta,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map