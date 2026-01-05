"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const connection_1 = require("./database/connection");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const client_routes_1 = __importDefault(require("./routes/client.routes"));
const conversation_routes_1 = __importDefault(require("./routes/conversation.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const projectTask_routes_1 = __importDefault(require("./routes/projectTask.routes"));
const projectChat_routes_1 = __importDefault(require("./routes/projectChat.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const scheduler_service_1 = require("./services/scheduler.service");
const app = (0, express_1.default)();
// Trust proxy for production (behind nginx)
if (config_1.config.isProduction) {
    app.set('trust proxy', 1);
}
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config_1.config.isProduction ? {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://nominatim.openstreetmap.org'],
        },
    } : false,
}));
app.use((0, cors_1.default)({
    origin: config_1.config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static files - serve uploads folder
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads'), {
    maxAge: config_1.config.isProduction ? '1d' : 0,
    etag: true,
}));
// Health check with database status
app.get('/health', (_req, res) => {
    const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
    if (dbStatus === 'connected') {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            environment: config_1.config.nodeEnv,
        });
    }
    else {
        res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: dbStatus,
        });
    }
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/clients', client_routes_1.default);
app.use('/api/conversations', conversation_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/upload', upload_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/employees', employee_routes_1.default);
app.use('/api/tasks', projectTask_routes_1.default);
app.use('/api/project-chat', projectChat_routes_1.default);
// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found',
        },
    });
});
// Error handling
app.use(error_middleware_1.errorHandler);
// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.warn(`\n${signal} received. Starting graceful shutdown...`);
    // Stop scheduler
    scheduler_service_1.schedulerService.stop();
    // Close database connection
    await (0, connection_1.disconnectDatabase)();
    console.warn('Graceful shutdown completed');
    process.exit(0);
};
// Start server
const startServer = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        // Start reminder scheduler
        scheduler_service_1.schedulerService.start();
        const server = app.listen(config_1.config.port, () => {
            console.warn(`🚀 Server running on port ${config_1.config.port} in ${config_1.config.nodeEnv} mode`);
            console.warn(`📍 Health check: http://localhost:${config_1.config.port}/health`);
        });
        // Handle graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            gracefulShutdown('uncaughtException');
        });
        process.on('unhandledRejection', (reason) => {
            console.error('Unhandled Rejection:', reason);
        });
        return server;
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map