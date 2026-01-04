import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
/**
 * Middleware to check if user is admin
 */
export declare const adminMiddleware: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=admin.middleware.d.ts.map