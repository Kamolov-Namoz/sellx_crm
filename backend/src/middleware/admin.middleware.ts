import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AppError } from './error.middleware';

/**
 * Middleware to check if user is admin
 */
export const adminMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
  }

  if (req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403, 'ADMIN_REQUIRED');
  }

  next();
};
