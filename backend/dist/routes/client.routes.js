"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const client_service_1 = require("../services/client.service");
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
// Valid client statuses
const VALID_STATUSES = ['new', 'thinking', 'agreed', 'rejected', 'callback'];
// Client creation validation
const createClientValidation = [
    (0, express_validator_1.body)('fullName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Full name cannot exceed 100 characters'),
    (0, express_validator_1.body)('companyName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),
    (0, express_validator_1.body)('phoneNumber')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required'),
    (0, express_validator_1.body)('location.latitude')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Valid latitude is required'),
    (0, express_validator_1.body)('location.longitude')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Valid longitude is required'),
    (0, express_validator_1.body)('location.address')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Address cannot exceed 200 characters'),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Notes cannot exceed 2000 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(VALID_STATUSES)
        .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
    (0, express_validator_1.body)('followUpDate')
        .optional({ values: 'null' })
        .isISO8601()
        .withMessage('Invalid date format'),
];
// Client update validation
const updateClientValidation = [
    (0, express_validator_1.body)('fullName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Full name cannot exceed 100 characters'),
    (0, express_validator_1.body)('companyName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),
    (0, express_validator_1.body)('phoneNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Phone number cannot be empty'),
    (0, express_validator_1.body)('location.latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Valid latitude is required'),
    (0, express_validator_1.body)('location.longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Valid longitude is required'),
    (0, express_validator_1.body)('location.address')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Address cannot exceed 200 characters'),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Notes cannot exceed 2000 characters'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(VALID_STATUSES)
        .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
    (0, express_validator_1.body)('followUpDate')
        .optional({ values: 'null' })
        .custom((value) => {
        if (value === null || value === '')
            return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
    })
        .withMessage('Invalid date format'),
];
// Query validation
const getClientsValidation = [
    (0, express_validator_1.query)('status')
        .optional()
        .isIn(VALID_STATUSES)
        .withMessage('Invalid status filter'),
    (0, express_validator_1.query)('sortBy')
        .optional()
        .isIn(['followUpDate', 'createdAt', 'name'])
        .withMessage('Invalid sort field'),
    (0, express_validator_1.query)('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
    (0, express_validator_1.query)('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search query too long'),
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
 * GET /api/clients/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await client_service_1.clientService.getStats(req.user.userId);
        res.json({ success: true, data: stats });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/clients
 * Get all clients for authenticated user
 */
router.get('/', getClientsValidation, validateRequest, async (req, res, next) => {
    try {
        const result = await client_service_1.clientService.getClients(req.user.userId, {
            status: req.query.status,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder,
            search: req.query.search,
            page: req.query.page ? parseInt(req.query.page, 10) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
        });
        res.json({ success: true, ...result });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/clients/:id
 * Get single client by ID
 */
router.get('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid client ID'), validateRequest, async (req, res, next) => {
    try {
        const client = await client_service_1.clientService.getClient(req.user.userId, req.params.id);
        res.json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/clients
 * Create new client
 */
router.post('/', createClientValidation, validateRequest, async (req, res, next) => {
    try {
        const client = await client_service_1.clientService.createClient(req.user.userId, req.body);
        res.status(201).json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/clients/:id
 * Update client
 */
router.put('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid client ID'), updateClientValidation, validateRequest, async (req, res, next) => {
    try {
        const client = await client_service_1.clientService.updateClient(req.user.userId, req.params.id, req.body);
        res.json({ success: true, data: client });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/clients/:id
 * Delete client
 */
router.delete('/:id', (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid client ID'), validateRequest, async (req, res, next) => {
    try {
        const result = await client_service_1.clientService.deleteClient(req.user.userId, req.params.id);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=client.routes.js.map