import { Router, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { clientService } from '../services/client.service';
import { AuthenticatedRequest, ClientStatus } from '../types';

const router = Router();

// Apply auth middleware to all client routes
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

// Valid client statuses
const VALID_STATUSES: ClientStatus[] = ['interested', 'thinking', 'callback', 'not_interested', 'deal_closed'];

// Client creation validation
const createClientValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .escape(),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .escape(),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
    .escape(),
  body('brandName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters')
    .escape(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters')
    .escape(),
  body('status')
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

// Client update validation (all fields optional)
const updateClientValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .escape(),
  body('phoneNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Phone number cannot be empty')
    .escape(),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters')
    .escape(),
  body('brandName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Brand name cannot exceed 100 characters')
    .escape(),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters')
    .escape(),
  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),
  body('followUpDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
];

// Query validation for GET
const getClientsValidation = [
  query('status')
    .optional()
    .isIn(['interested', 'thinking', 'callback', 'not_interested', 'deal_closed'])
    .withMessage('Invalid status filter'),
  query('sortBy')
    .optional()
    .isIn(['followUpDate', 'createdAt', 'name'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
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
 * GET /api/clients/stats
 * Get dashboard statistics
 */
router.get(
  '/stats',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const stats = await clientService.getStats(userId);

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
 * GET /api/clients
 * Get all clients for authenticated user
 */
router.get(
  '/',
  getClientsValidation,
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await clientService.getClients(userId, {
        status: req.query.status as ClientStatus | undefined,
        sortBy: req.query.sortBy as 'followUpDate' | 'createdAt' | 'name' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        search: req.query.search as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/clients/:id
 * Get single client by ID
 */
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid client ID'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const client = await clientService.getClient(userId, req.params.id);

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/clients
 * Create new client
 */
router.post(
  '/',
  createClientValidation,
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const client = await clientService.createClient(userId, req.body);

      res.status(201).json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/clients/:id
 * Update client
 */
router.put(
  '/:id',
  param('id').isMongoId().withMessage('Invalid client ID'),
  updateClientValidation,
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const client = await clientService.updateClient(userId, req.params.id, req.body);

      res.json({
        success: true,
        data: client,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/clients/:id
 * Delete client
 */
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid client ID'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await clientService.deleteClient(userId, req.params.id);

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
