import { Types } from 'mongoose';

/**
 * Transform MongoDB document to API response format
 * - Converts ObjectId to string
 * - Converts Date to ISO string
 * - Removes sensitive fields
 */
export function serializeDocument<T extends Record<string, unknown>>(
  doc: T,
  options: {
    excludeFields?: string[];
    dateFields?: string[];
  } = {}
): Record<string, unknown> {
  const { excludeFields = ['__v'] } = options;

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(doc)) {
    // Skip excluded fields
    if (excludeFields.includes(key)) {
      continue;
    }

    // Transform ObjectId
    if (value instanceof Types.ObjectId) {
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
      result[key] = serializeDocument(value as Record<string, unknown>, options);
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item instanceof Types.ObjectId) {
          return item.toString();
        }
        if (item instanceof Date) {
          return item.toISOString();
        }
        if (item && typeof item === 'object') {
          return serializeDocument(item as Record<string, unknown>, options);
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
export function serializeClient(client: Record<string, unknown>): Record<string, unknown> {
  return serializeDocument(client, {
    excludeFields: ['__v'],
    dateFields: ['createdAt', 'updatedAt', 'followUpDate'],
  });
}

/**
 * Serialize a user document for API response (excludes sensitive data)
 */
export function serializeUser(user: Record<string, unknown>): Record<string, unknown> {
  return serializeDocument(user, {
    excludeFields: ['__v', 'passwordHash', 'fcmTokens'],
    dateFields: ['createdAt', 'updatedAt'],
  });
}

/**
 * Create a standardized API response
 */
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  meta?: Record<string, unknown>
): {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
} {
  const response: {
    success: boolean;
    data?: T;
    message?: string;
    meta?: Record<string, unknown>;
  } = { success };

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
