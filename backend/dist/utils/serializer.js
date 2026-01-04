"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDocument = serializeDocument;
exports.serializeClient = serializeClient;
exports.serializeUser = serializeUser;
exports.createApiResponse = createApiResponse;
const mongoose_1 = require("mongoose");
/**
 * Transform MongoDB document to API response format
 * - Converts ObjectId to string
 * - Converts Date to ISO string
 * - Removes sensitive fields
 */
function serializeDocument(doc, options = {}) {
    const { excludeFields = ['__v'] } = options;
    const result = {};
    for (const [key, value] of Object.entries(doc)) {
        // Skip excluded fields
        if (excludeFields.includes(key)) {
            continue;
        }
        // Transform ObjectId
        if (value instanceof mongoose_1.Types.ObjectId) {
            result[key] = value.toString();
            continue;
        }
        // Transform Date
        if (value instanceof Date) {
            result[key] = value.toISOString();
            continue;
        }
        // Handle nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            result[key] = serializeDocument(value, options);
            continue;
        }
        // Handle arrays
        if (Array.isArray(value)) {
            result[key] = value.map((item) => {
                if (item instanceof mongoose_1.Types.ObjectId) {
                    return item.toString();
                }
                if (item instanceof Date) {
                    return item.toISOString();
                }
                if (item && typeof item === 'object') {
                    return serializeDocument(item, options);
                }
                return item;
            });
            continue;
        }
        result[key] = value;
    }
    return result;
}
/**
 * Serialize a client document for API response
 */
function serializeClient(client) {
    return serializeDocument(client, {
        excludeFields: ['__v'],
        dateFields: ['createdAt', 'updatedAt', 'followUpDate'],
    });
}
/**
 * Serialize a user document for API response (excludes sensitive data)
 */
function serializeUser(user) {
    return serializeDocument(user, {
        excludeFields: ['__v', 'passwordHash', 'fcmTokens'],
        dateFields: ['createdAt', 'updatedAt'],
    });
}
/**
 * Create a standardized API response
 */
function createApiResponse(success, data, message, meta) {
    const response = { success };
    if (data !== undefined) {
        response.data = data;
    }
    if (message) {
        response.message = message;
    }
    if (meta) {
        response.meta = meta;
    }
    return response;
}
//# sourceMappingURL=serializer.js.map