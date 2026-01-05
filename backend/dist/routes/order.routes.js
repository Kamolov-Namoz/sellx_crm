"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const order_service_1 = require("../services/order.service");
const models_1 = require("../models");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
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
const VALID_STATUSES = ['new', 'in_progress', 'completed'];
// Create order validation
const createOrderValidation = [
    (0, express_validator_1.body)('clientId')
        .isMongoId()
        .withMessage('Valid client ID is required'),
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Title must be between 2 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    (0, express_validator_1.body)('amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(VALID_STATUSES)
        .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];
// Update order validation
const updateOrderValidation = [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid order ID is required'),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Title must be between 2 and 200 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description cannot exceed 2000 characters'),
    (0, express_validator_1.body)('amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(VALID_STATUSES)
        .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];
// Query validation
const queryValidation = [
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(VALID_STATUSES)
        .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
    (0, express_validator_1.query)('clientId')
        .optional()
        .isMongoId()
        .withMessage('Valid client ID is required'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isIn(['createdAt', 'amount'])
        .withMessage('sortBy must be createdAt or amount'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('sortOrder must be asc or desc'),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
];
/**
 * GET /api/orders
 * Get all orders for current user
 */
router.get('/', queryValidation, validateRequest, async (req, res, next) => {
    try {
        const result = await order_service_1.orderService.getOrders(req.user.userId, {
            status: req.query.status,
            clientId: req.query.clientId,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
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
/**
 * GET /api/orders/stats
 * Get order statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await order_service_1.orderService.getOrderStats(req.user.userId);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/orders/developers
 * Get all developers for task assignment
 */
router.get('/developers', [(0, express_validator_1.query)('search').optional().trim()], validateRequest, async (req, res, next) => {
    try {
        const search = req.query.search;
        const filter = { role: 'developer' };
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
            ];
        }
        const developers = await models_1.User.find(filter)
            .select('_id firstName lastName username phoneNumber')
            .sort({ firstName: 1 })
            .lean();
        res.json({
            success: true,
            data: developers,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/orders/:id
 * Get single order
 */
router.get('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Valid order ID is required'), validateRequest, async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.getOrderById(req.user.userId, req.params.id);
        res.json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/orders
 * Create new order
 */
router.post('/', createOrderValidation, validateRequest, async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.createOrder(req.user.userId, req.body);
        res.status(201).json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/orders/:id
 * Update order
 */
router.put('/:id', updateOrderValidation, validateRequest, async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.updateOrder(req.user.userId, req.params.id, req.body);
        res.json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/orders/:id
 * Delete order
 */
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Valid order ID is required'), validateRequest, async (req, res, next) => {
    try {
        await order_service_1.orderService.deleteOrder(req.user.userId, req.params.id);
        res.json({
            success: true,
            message: 'Zakaz o\'chirildi',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/orders/:id/milestones/:milestoneId
 * Update milestone status
 */
router.patch('/:id/milestones/:milestoneId', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Valid order ID is required'),
    (0, express_validator_1.param)('milestoneId').isMongoId().withMessage('Valid milestone ID is required'),
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'in_progress', 'completed', 'paid'])
        .withMessage('Status must be one of: pending, in_progress, completed, paid'),
], validateRequest, async (req, res, next) => {
    try {
        const order = await order_service_1.orderService.updateMilestoneStatus(req.user.userId, req.params.id, req.params.milestoneId, req.body.status);
        res.json({
            success: true,
            data: order,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=order.routes.js.map