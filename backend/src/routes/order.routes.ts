import { Router, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { orderService } from '../services/order.service';
import { User } from '../models';
import { AuthenticatedRequest, OrderStatus } from '../types';

const router = Router();

router.use(authMiddleware);

// Validation middleware
const validateRequest = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
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

const VALID_STATUSES: OrderStatus[] = ['new', 'in_progress', 'completed'];

// Create order validation
const createOrderValidation = [
  body('clientId')
    .isMongoId()
    .withMessage('Valid client ID is required'),
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];

// Update order validation
const updateOrderValidation = [
  param('id').isMongoId().withMessage('Valid order ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Title must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
];

// Query validation
const queryValidation = [
  query('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  query('clientId')
    .optional()
    .isMongoId()
    .withMessage('Valid client ID is required'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'amount'])
    .withMessage('sortBy must be createdAt or amount'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be asc or desc'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

/**
 * GET /api/orders
 * Get all orders for current user
 */
router.get(
  '/',
  queryValidation,
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await orderService.getOrders(req.user!.userId, {
        status: req.query.status as OrderStatus,
        clientId: req.query.clientId as string,
        sortBy: req.query.sortBy as 'createdAt' | 'amount',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result.orders,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/orders/stats
 * Get order statistics
 */
router.get(
  '/stats',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await orderService.getOrderStats(req.user!.userId);
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/orders/developers
 * Get all developers for task assignment
 */
router.get(
  '/developers',
  [query('search').optional().trim()],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const search = req.query.search as string;

      const filter: Record<string, unknown> = { role: 'developer' };
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ];
      }

      const developers = await User.find(filter)
        .select('_id firstName lastName username phoneNumber')
        .sort({ firstName: 1 })
        .lean();

      res.json({
        success: true,
        data: developers,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/orders/:id
 * Get single order
 */
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Valid order ID is required'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.getOrderById(req.user!.userId, req.params.id);
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/orders
 * Create new order
 */
router.post(
  '/',
  createOrderValidation,
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.createOrder(req.user!.userId, req.body);
      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/orders/:id
 * Update order
 */
router.put(
  '/:id',
  updateOrderValidation,
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.updateOrder(
        req.user!.userId,
        req.params.id,
        req.body
      );
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/orders/:id
 * Delete order
 */
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Valid order ID is required'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await orderService.deleteOrder(req.user!.userId, req.params.id);
      res.json({
        success: true,
        message: 'Zakaz o\'chirildi',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/orders/:id/milestones/:milestoneId
 * Update milestone status
 */
router.patch(
  '/:id/milestones/:milestoneId',
  [
    param('id').isMongoId().withMessage('Valid order ID is required'),
    param('milestoneId').isMongoId().withMessage('Valid milestone ID is required'),
    body('status')
      .isIn(['pending', 'in_progress', 'completed', 'paid'])
      .withMessage('Status must be one of: pending, in_progress, completed, paid'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.updateMilestoneStatus(
        req.user!.userId,
        req.params.id,
        req.params.milestoneId,
        req.body.status
      );
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/orders/:id/milestones/:milestoneId
 * Update milestone details
 */
router.put(
  '/:id/milestones/:milestoneId',
  [
    param('id').isMongoId().withMessage('Valid order ID is required'),
    param('milestoneId').isMongoId().withMessage('Valid milestone ID is required'),
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().trim(),
    body('amount').optional().isFloat({ min: 0 }),
    body('percentage').optional().isFloat({ min: 0, max: 100 }),
    body('dueDate').optional(),
    body('tasks').optional().isArray(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.updateMilestone(
        req.user!.userId,
        req.params.id,
        req.params.milestoneId,
        req.body
      );
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/orders/:id/milestones/:milestoneId
 * Delete milestone
 */
router.delete(
  '/:id/milestones/:milestoneId',
  [
    param('id').isMongoId().withMessage('Valid order ID is required'),
    param('milestoneId').isMongoId().withMessage('Valid milestone ID is required'),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const order = await orderService.deleteMilestone(
        req.user!.userId,
        req.params.id,
        req.params.milestoneId
      );
      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
