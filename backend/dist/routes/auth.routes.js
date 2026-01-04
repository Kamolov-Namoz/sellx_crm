"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_service_1 = require("../services/auth.service");
const error_middleware_1 = require("../middleware/error.middleware");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const router = (0, express_1.Router)();
// Apply rate limiting to auth routes
router.use(rateLimit_middleware_1.authRateLimit);
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
// Register validation rules
const registerValidation = [
    (0, express_validator_1.body)('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
];
// Login validation rules
const loginValidation = [
    (0, express_validator_1.body)('username').trim().notEmpty().withMessage('Username is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerValidation, validateRequest, async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await auth_service_1.authService.register(username, password);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', loginValidation, validateRequest, async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await auth_service_1.authService.login(username, password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map