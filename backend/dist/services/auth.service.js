"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const models_1 = require("../models");
const error_middleware_1 = require("../middleware/error.middleware");
const SALT_ROUNDS = 12;
// Password validation rules
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
};
class AuthService {
    /**
     * Validate password strength
     */
    validatePassword(password) {
        const errors = [];
        if (password.length < PASSWORD_MIN_LENGTH) {
            errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
        }
        if (!PASSWORD_REGEX.uppercase.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!PASSWORD_REGEX.lowercase.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!PASSWORD_REGEX.number.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (errors.length > 0) {
            throw new error_middleware_1.AppError('Password validation failed', 400, 'VALIDATION_ERROR', { password: errors });
        }
    }
    /**
     * Register a new user
     */
    async register(data) {
        const { firstName, lastName, username, phoneNumber, password } = data;
        // Validate password strength on backend
        this.validatePassword(password);
        // Check if username already exists
        const existingUser = await models_1.User.findOne({
            $or: [{ username }, { phoneNumber }]
        });
        if (existingUser) {
            if (existingUser.username === username) {
                throw new error_middleware_1.AppError('Username already exists', 409, 'DUPLICATE_USERNAME');
            }
            throw new error_middleware_1.AppError('Phone number already exists', 409, 'DUPLICATE_PHONE');
        }
        // Hash password with bcrypt
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create user
        const user = await models_1.User.create({
            firstName,
            lastName,
            username,
            phoneNumber,
            passwordHash,
            role: 'user',
            fcmTokens: [],
        });
        return {
            success: true,
            message: 'User registered successfully',
            userId: user._id.toString(),
        };
    }
    /**
     * Login user and return JWT token
     */
    async login(username, password) {
        // Find user by username
        const user = await models_1.User.findOne({ username });
        if (!user) {
            throw new error_middleware_1.AppError('Invalid credentials', 401, 'AUTH_INVALID_CREDENTIALS');
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new error_middleware_1.AppError('Invalid credentials', 401, 'AUTH_INVALID_CREDENTIALS');
        }
        // Generate JWT token
        const payload = {
            userId: user._id.toString(),
            username: user.username,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwtSecret, {
            expiresIn: config_1.config.jwtExpiresIn,
        });
        // Calculate expiration in seconds
        const expiresIn = this.parseExpiresIn(config_1.config.jwtExpiresIn);
        return {
            success: true,
            token,
            expiresIn,
            userId: user._id.toString(),
            role: user.role,
        };
    }
    /**
     * Parse JWT expiration string to seconds
     */
    parseExpiresIn(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            return 3600; // Default 1 hour
        const value = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 3600;
            case 'd':
                return value * 86400;
            default:
                return 3600;
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map