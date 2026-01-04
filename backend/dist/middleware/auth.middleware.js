"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const error_middleware_1 = require("./error.middleware");
const authMiddleware = (req, _res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_middleware_1.AppError('No token provided', 401, 'AUTH_TOKEN_INVALID');
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        if (!token) {
            throw new error_middleware_1.AppError('No token provided', 401, 'AUTH_TOKEN_INVALID');
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        // Attach user context to request
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            next(new error_middleware_1.AppError('Token has expired', 401, 'AUTH_TOKEN_EXPIRED'));
            return;
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            next(new error_middleware_1.AppError('Invalid token', 401, 'AUTH_TOKEN_INVALID'));
            return;
        }
        if (error instanceof error_middleware_1.AppError) {
            next(error);
            return;
        }
        next(new error_middleware_1.AppError('Authentication failed', 401, 'AUTH_TOKEN_INVALID'));
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map