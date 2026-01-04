import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import mongoose from 'mongoose';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './database/connection';
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import conversationRoutes from './routes/conversation.routes';
import notificationRoutes from './routes/notification.routes';
import uploadRoutes from './routes/upload.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/error.middleware';
import { schedulerService } from './services/scheduler.service';

const app = express();

// Trust proxy for production (behind nginx)
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: config.isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://nominatim.openstreetmap.org'],
    },
  } : false,
}));

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve uploads folder
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: config.isProduction ? '1d' : 0,
  etag: true,
}));

// Health check with database status
app.get('/health', (_req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  if (dbStatus === 'connected') {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: config.nodeEnv,
    });
  } else {
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

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
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.warn(`\n${signal} received. Starting graceful shutdown...`);
  
  // Stop scheduler
  schedulerService.stop();
  
  // Close database connection
  await disconnectDatabase();
  
  console.warn('Graceful shutdown completed');
  process.exit(0);
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    // Start reminder scheduler
    schedulerService.start();
    
    const server = app.listen(config.port, () => {
      console.warn(`🚀 Server running on port ${config.port} in ${config.nodeEnv} mode`);
      console.warn(`📍 Health check: http://localhost:${config.port}/health`);
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

    return server as unknown as void;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
