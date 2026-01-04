/**
 * Transform MongoDB document to API response format
 * - Converts ObjectId to string
 * - Converts Date to ISO string
 * - Removes sensitive fields
 */
export declare function serializeDocument<T extends Record<string, unknown>>(doc: T, options?: {
    excludeFields?: string[];
    dateFields?: string[];
}): Record<string, unknown>;
/**
 * Serialize a client document for API response
 */
export declare function serializeClient(client: Record<string, unknown>): Record<string, unknown>;
/**
 * Serialize a user document for API response (excludes sensitive data)
 */
export declare function serializeUser(user: Record<string, unknown>): Record<string, unknown>;
/**
 * Create a standardized API response
 */
export declare function createApiResponse<T>(success: boolean, data?: T, message?: string, meta?: Record<string, unknown>): {
    success: boolean;
    data?: T;
    message?: string;
    meta?: Record<string, unknown>;
};
//# sourceMappingURL=serializer.d.ts.map