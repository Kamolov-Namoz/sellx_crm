"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(config_1.config.mongodbUri);
        console.warn('MongoDB connected successfully');
        // Drop old email index if exists (legacy cleanup)
        try {
            const db = mongoose_1.default.connection.db;
            if (db) {
                const collections = await db.listCollections({ name: 'users' }).toArray();
                if (collections.length > 0) {
                    const indexes = await db.collection('users').indexes();
                    const emailIndex = indexes.find((idx) => idx.name === 'email_1');
                    if (emailIndex) {
                        await db.collection('users').dropIndex('email_1');
                        console.warn('Dropped legacy email_1 index');
                    }
                }
            }
        }
        catch {
            // Index doesn't exist or already dropped - ignore
        }
        mongoose_1.default.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.warn('MongoDB connection closed due to app termination');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    await mongoose_1.default.connection.close();
};
exports.disconnectDatabase = disconnectDatabase;
//# sourceMappingURL=connection.js.map