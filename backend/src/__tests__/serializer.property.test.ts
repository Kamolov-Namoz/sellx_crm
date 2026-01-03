/**
 * Property-Based Tests for API Serialization
 * **Feature: sales-automation-pwa**
 */

import * as fc from 'fast-check';
import { Types } from 'mongoose';
import { serializeDocument, serializeClient } from '../utils/serializer';

/**
 * **Property 16: API response serialization round-trip**
 * **Validates: Requirements 6.3**
 * 
 * *For any* client object stored in MongoDB, retrieving it via the API
 * and comparing the JSON response fields should show equivalent data.
 */
describe('Property 16: API response serialization round-trip', () => {
  const clientStatusArb = fc.constantFrom('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');

  it('should serialize ObjectId to string', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const objectId = new Types.ObjectId();
        const doc = { _id: objectId, name: 'test' };

        const serialized = serializeDocument(doc);

        expect(typeof serialized._id).toBe('string');
        expect(serialized._id).toBe(objectId.toString());

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should serialize Date to ISO string', () => {
    fc.assert(
      fc.property(fc.date(), (date) => {
        const doc = { createdAt: date, name: 'test' };

        const serialized = serializeDocument(doc);

        expect(typeof serialized.createdAt).toBe('string');
        expect(serialized.createdAt).toBe(date.toISOString());

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve primitive values', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.integer(),
        fc.boolean(),
        (str, num, bool) => {
          const doc = { str, num, bool };

          const serialized = serializeDocument(doc);

          expect(serialized.str).toBe(str);
          expect(serialized.num).toBe(num);
          expect(serialized.bool).toBe(bool);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should exclude __v field', () => {
    fc.assert(
      fc.property(fc.integer(), (version) => {
        const doc = { name: 'test', __v: version };

        const serialized = serializeDocument(doc);

        expect(serialized.__v).toBeUndefined();
        expect(serialized.name).toBe('test');

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should handle nested objects', () => {
    fc.assert(
      fc.property(fc.string(), fc.date(), (name, date) => {
        const objectId = new Types.ObjectId();
        const doc = {
          name,
          nested: {
            _id: objectId,
            createdAt: date,
          },
        };

        const serialized = serializeDocument(doc);

        expect(typeof (serialized.nested as Record<string, unknown>)._id).toBe('string');
        expect(typeof (serialized.nested as Record<string, unknown>).createdAt).toBe('string');

        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should handle arrays with ObjectIds', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constant(null).map(() => new Types.ObjectId()), { minLength: 1, maxLength: 5 }),
        (objectIds) => {
          const doc = { ids: objectIds };

          const serialized = serializeDocument(doc);

          expect(Array.isArray(serialized.ids)).toBe(true);
          (serialized.ids as string[]).forEach((id, i) => {
            expect(typeof id).toBe('string');
            expect(id).toBe(objectIds[i].toString());
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should serialize full client document correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 100 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        clientStatusArb,
        fc.date(),
        fc.date(),
        (fullName, phoneNumber, status, createdAt, updatedAt) => {
          const client = {
            _id: new Types.ObjectId(),
            userId: new Types.ObjectId(),
            fullName,
            phoneNumber,
            status,
            createdAt,
            updatedAt,
            __v: 0,
          };

          const serialized = serializeClient(client);

          // ObjectIds should be strings
          expect(typeof serialized._id).toBe('string');
          expect(typeof serialized.userId).toBe('string');

          // Dates should be ISO strings
          expect(typeof serialized.createdAt).toBe('string');
          expect(typeof serialized.updatedAt).toBe('string');

          // Primitives preserved
          expect(serialized.fullName).toBe(fullName);
          expect(serialized.phoneNumber).toBe(phoneNumber);
          expect(serialized.status).toBe(status);

          // __v excluded
          expect(serialized.__v).toBeUndefined();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
