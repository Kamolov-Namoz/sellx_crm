"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const error_middleware_1 = require("./error.middleware");
/**
 * Middleware to check if user is admin
 */
const adminMiddleware = (req, _res, next) => {
    if (!req.user) {
        throw new error_middleware_1.AppError('Authentication required', 401, 'AUTH_REQUIRED');
    }
    if (req.user.role !== 'admin') {
        throw new error_middleware_1.AppError('Admin access required', 403, 'ADMIN_REQUIRED');
    }
    next();
};
exports.adminMiddleware = adminMiddleware;
//# sourceMappingURL=admin.middleware.js.map