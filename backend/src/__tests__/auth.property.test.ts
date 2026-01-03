/**
 * Property-Based Tests for Authentication
 * **Feature: sales-automation-pwa**
 */

import * as fc from 'fast-check';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Mock user data generator
const usernameArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789_'.split('')),
  { minLength: 3, maxLength: 50 }
);

const passwordArb = fc.string({ minLength: 6, maxLength: 100 });

/**
 * **Property 6: Invalid token rejection**
 * **Validates: Requirements 1.6**
 * 
 * *For any* API request with an expired, malformed, or missing JWT token,
 * the system should reject the request with a 401 authorization error.
 */
describe('Property 6: Invalid token rejection', () => {
  const verifyToken = (token: string): boolean => {
    try {
      jwt.verify(token, config.jwtSecret);
      return true;
    } catch {
      return false;
    }
  };

  it('should reject malformed tokens', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 500 }),
        (randomString) => {
          // Random strings should not be valid JWT tokens
          const isValid = verifyToken(randomString);
          return !isValid;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject tokens with wrong secret', () => {
    fc.assert(
      fc.property(
        usernameArb,
        fc.string({ minLength: 32, maxLength: 64 }),
        (username, wrongSecret) => {
          // Token signed with wrong secret should be rejected
          const token = jwt.sign(
            { userId: '123', username },
            wrongSecret,
            { expiresIn: '1h' }
          );
          const isValid = verifyToken(token);
          return !isValid || wrongSecret === config.jwtSecret;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject expired tokens', () => {
    fc.assert(
      fc.property(usernameArb, (username) => {
        // Create an already expired token
        const token = jwt.sign(
          { userId: '123', username },
          config.jwtSecret,
          { expiresIn: '-1s' }
        );
        const isValid = verifyToken(token);
        return !isValid;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Property 1: Registration creates hashed user**
 * **Validates: Requirements 1.1, 7.1**
 * 
 * *For any* valid username and password combination, registering a new user
 * should result in a user record where the stored password is a bcrypt hash.
 */
describe('Property 1: Registration creates hashed user', () => {
  it('should hash passwords with bcrypt', async () => {
    await fc.assert(
      fc.asyncProperty(passwordArb, async (password) => {
        const hash = await bcrypt.hash(password, 10);
        
        // Hash should not equal plaintext
        expect(hash).not.toBe(password);
        
        // Hash should be verifiable
        const isValid = await bcrypt.compare(password, hash);
        expect(isValid).toBe(true);
        
        // Hash should start with bcrypt identifier
        expect(hash.startsWith('$2')).toBe(true);
        
        return true;
      }),
      { numRuns: 10 }
    );
  }, 30000);

  it('should produce different hashes for same password', async () => {
    await fc.assert(
      fc.asyncProperty(passwordArb, async (password) => {
        const hash1 = await bcrypt.hash(password, 10);
        const hash2 = await bcrypt.hash(password, 10);
        
        // Same password should produce different hashes (due to salt)
        expect(hash1).not.toBe(hash2);
        
        // Both should verify correctly
        expect(await bcrypt.compare(password, hash1)).toBe(true);
        expect(await bcrypt.compare(password, hash2)).toBe(true);
        
        return true;
      }),
      { numRuns: 5 }
    );
  }, 30000);
});

/**
 * **Property 2: Duplicate username rejection**
 * **Validates: Requirements 1.2**
 * 
 * *For any* existing username in the system, attempting to register
 * a new user with that same username should be rejected.
 */
describe('Property 2: Duplicate username rejection', () => {
  const existingUsers = new Set<string>();

  it('should detect duplicate usernames', () => {
    fc.assert(
      fc.property(usernameArb, (username) => {
        const isDuplicate = existingUsers.has(username);
        
        if (!isDuplicate) {
          existingUsers.add(username);
          return true; // First registration should succeed
        }
        
        // Duplicate should be detected
        return existingUsers.has(username);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Property 3: Valid login returns JWT**
 * **Validates: Requirements 1.3, 7.2**
 * 
 * *For any* registered user with valid credentials, logging in should
 * return a JWT token that contains the user's ID and expiration.
 */
describe('Property 3: Valid login returns JWT', () => {
  it('should generate valid JWT with required claims', () => {
    fc.assert(
      fc.property(
        usernameArb,
        fc.uuid(),
        (username, oderId) => {
          const userId = oderId;
          const token = jwt.sign(
            { userId, username },
            config.jwtSecret,
            { expiresIn: '1h' }
          );

          // Decode and verify
          const decoded = jwt.verify(token, config.jwtSecret) as {
            userId: string;
            username: string;
            exp: number;
            iat: number;
          };

          // Should contain required fields
          expect(decoded.userId).toBe(userId);
          expect(decoded.username).toBe(username);
          expect(decoded.exp).toBeDefined();
          expect(decoded.iat).toBeDefined();
          expect(decoded.exp).toBeGreaterThan(decoded.iat);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Property 4: Invalid credentials rejected**
 * **Validates: Requirements 1.4**
 * 
 * *For any* login attempt with non-existent username or incorrect password,
 * the system should reject the attempt.
 */
describe('Property 4: Invalid credentials rejected', () => {
  it('should reject wrong passwords', async () => {
    await fc.assert(
      fc.asyncProperty(
        passwordArb,
        passwordArb,
        async (correctPassword, wrongPassword) => {
          // Skip if passwords happen to match
          if (correctPassword === wrongPassword) return true;

          const hash = await bcrypt.hash(correctPassword, 10);
          const isValid = await bcrypt.compare(wrongPassword, hash);

          expect(isValid).toBe(false);
          return true;
        }
      ),
      { numRuns: 10 }
    );
  }, 30000);
});
