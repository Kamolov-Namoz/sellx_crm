import { Router, Response, NextFunction } from 'express';
import { query, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { AppError } from '../middleware/error.middleware';
import { User, Client, Order } from '../models';
import { orderService } from '../services/order.service';
import { AuthenticatedRequest, ClientStatus, OrderStatus } from '../types';

const router = Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

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

/**
 * GET /api/admin/stats
 * Get overall statistics
 */
router.get(
  '/stats',
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const [
        totalUsers,
        totalClients,
        totalOrders,
        clientsByStatus,
        ordersByStatus,
        recentUsers,
      ] = await Promise.all([
        User.countDocuments(),
        Client.countDocuments(),
        Order.countDocuments(),
        Client.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Order.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: { $ifNull: ['$amount', 0] } },
            },
          },
        ]),
        User.find()
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/users
 * Get all users
 */
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;

      const filter: Record<string, unknown> = {};
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-passwordHash -fcmTokens')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(filter),
      ]);

      // Get client and order counts for each user
      const userIds = users.map((u) => u._id);
      const [clientCounts, orderCounts] = await Promise.all([
        Client.aggregate([
          { $match: { userId: { $in: userIds } } },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
        ]),
        Order.aggregate([
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
router.get(
  '/users/:id',
  param('id').isMongoId().withMessage('Valid user ID is required'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id)
        .select('-passwordHash -fcmTokens')
        .lean();

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const [clientCount, orderCount, recentClients, recentOrders] = await Promise.all([
        Client.countDocuments({ userId: user._id }),
        Order.countDocuments({ userId: user._id }),
        Client.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Order.find({ userId: user._id })
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/clients
 * Get all clients (all users)
 */
router.get(
  '/clients',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['new', 'thinking', 'agreed', 'rejected', 'callback']),
    query('userId').optional().isMongoId(),
    query('search').optional().trim(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as ClientStatus;
      const userId = req.query.userId as string;
      const search = req.query.search as string;

      const filter: Record<string, unknown> = {};
      if (status) filter.status = status;
      if (userId) filter.userId = new mongoose.Types.ObjectId(userId);
      if (search) {
        filter.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ];
      }

      const [clients, total] = await Promise.all([
        Client.find(filter)
          .populate('userId', 'firstName lastName username')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Client.countDocuments(filter),
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/clients/map
 * Get all clients with location for map view
 */
router.get(
  '/clients/map',
  async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const clients = await Client.find({
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
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/admin/orders
 * Get all orders (all users)
 */
router.get(
  '/orders',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(['new', 'in_progress', 'completed']),
    query('userId').optional().isMongoId(),
    query('clientId').optional().isMongoId(),
  ],
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await orderService.getAllOrders({
        status: req.query.status as OrderStatus,
        userId: req.query.userId as string,
        clientId: req.query.clientId as string,
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

export default router;
