import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { RegisterRequest, LoginRequest } from '../types';

const router = Router();

// Apply rate limiting to auth routes
router.use(authRateLimit);

// Validation middleware
const validateRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details: Record<string, string[]> = {};
    errors.array().forEach((error) => {
      if (error.type === 'field') {
        const field = error.path;
        if (!details[field]) {
          details[field] = [];
        }
        details[field].push(error.msg);
      }
    });
    throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', details);
  }
  next();
};

// Register validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
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
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  registerValidation,
  validateRequest,
  async (req: Request<object, object, RegisterRequest>, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const result = await authService.register(username, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post(
  '/login',
  loginValidation,
  validateRequest,
  async (req: Request<object, object, LoginRequest>, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
