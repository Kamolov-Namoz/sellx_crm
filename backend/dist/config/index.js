"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
// Validate required environment variables in production
function validateConfig() {
    const errors = [];
    if (isProduction) {
        if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
            errors.push('JWT_SECRET must be at least 32 characters in production');
        }
        if (!process.env.MONGODB_URI) {
            errors.push('MONGODB_URI is required in production');
        }
        if (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === '*') {
            errors.push('CORS_ORIGIN must be set to specific domain in production');
        }
    }
    if (errors.length > 0) {
        console.error('Configuration errors:');
        errors.forEach((err) => console.error(`  - ${err}`));
        process.exit(1);
    }
}
// Generate secure JWT secret for development
function getJwtSecret() {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }
    if (isProduction) {
        throw new Error('JWT_SECRET is required in production');
    }
    // Generate random secret for development (changes on restart)
    console.warn('WARNING: Using auto-generated JWT_SECRET. Set JWT_SECRET in .env for persistent sessions.');
    return crypto_1.default.randomBytes(64).toString('hex');
}
validateConfig();
exports.config = {
    // Server
    port: parseInt(process.env.PORT || '9999', 10),
    nodeEnv,
    isProduction,
    // MongoDB
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sales-automation',
    // JWT
    jwtSecret: getJwtSecret(),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // Firebase
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    },
    // CORS
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:9090',
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map