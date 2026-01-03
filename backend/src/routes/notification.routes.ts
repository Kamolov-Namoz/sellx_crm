import { Router, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { notificationService } from '../services/notification.service';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Apply auth middleware
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

/**
 * POST /api/notifications/subscribe
 * Register FCM token for push notifications
 */
router.post(
  '/subscribe',
  body('deviceToken').notEmpty().withMessage('Device token is required'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { deviceToken } = req.body;

      await notificationService.registerToken(userId, deviceToken);

      res.json({
        success: true,
        message: 'Device registered for notifications',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/notifications/unsubscribe
 * Remove FCM token
 */
router.delete(
  '/unsubscribe',
  body('deviceToken').notEmpty().withMessage('Device token is required'),
  validateRequest,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { deviceToken } = req.body;

      await notificationService.removeToken(userId, deviceToken);

      res.json({
        success: true,
        message: 'Device unregistered from notifications',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/notifications/test
 * Send test notification (for development)
 */
router.post(
  '/test',
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      
      // Get user's tokens
      const { User } = await import('../models');
      const user = await User.findById(userId);
      
      if (!user || user.fcmTokens.length === 0) {
        res.json({
          success: false,
          message: 'No registered devices found',
        });
        return;
      }

      const result = await notificationService.sendNotification(
        user.fcmTokens,
        'Test bildirishnoma',
        'Bu test bildirishnomasi',
        { action: 'test' }
      );

      res.json({
        success: true,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
