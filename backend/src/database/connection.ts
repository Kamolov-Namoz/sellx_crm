import mongoose from 'mongoose';
import { config } from '../config';

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.warn('MongoDB connected successfully');

    // Drop old email index if exists (legacy cleanup)
    try {
      const db = mongoose.connection.db;
      if (db) {
        const collections = await db.listCollections({ name: 'users' }).toArray();
        if (collections.length > 0) {
          const indexes = await db.collection('users').indexes();
          const emailIndex = indexes.find((idx: { name?: string }) => idx.name === 'email_1');
          if (emailIndex) {
            await db.collection('users').dropIndex('email_1');
            console.warn('Dropped legacy email_1 index');
          }
        }
      }
    } catch {
      // Index doesn't exist or already dropped - ignore
    }

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.warn('MongoDB connection closed due to app termination');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.connection.close();
};
