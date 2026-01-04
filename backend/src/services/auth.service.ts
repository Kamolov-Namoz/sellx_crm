import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models';
import { AuthResponse, JwtPayload, RegisterRequest } from '../types';
import { AppError } from '../middleware/error.middleware';

const SALT_ROUNDS = 12;

// Password validation rules
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
};

export class AuthService {
  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    const errors: string[] = [];

    if (password.length < PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (!PASSWORD_REGEX.uppercase.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!PASSWORD_REGEX.lowercase.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!PASSWORD_REGEX.number.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (errors.length > 0) {
      throw new AppError('Password validation failed', 400, 'VALIDATION_ERROR', { password: errors });
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { firstName, lastName, username, phoneNumber, password } = data;

    // Validate password strength on backend
    this.validatePassword(password);

    // Check if username already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { phoneNumber }] 
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw new AppError('Username already exists', 409, 'DUPLICATE_USERNAME');
      }
      throw new AppError('Phone number already exists', 409, 'DUPLICATE_PHONE');
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      username,
      phoneNumber,
      passwordHash,
      role: 'user',
      fcmTokens: [],
    });

    return {
      success: true,
      message: 'User registered successfully',
      userId: user._id.toString(),
    };
  }

  /**
   * Login user and return JWT token
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      throw new AppError('Invalid credentials', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'AUTH_INVALID_CREDENTIALS');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as string,
    } as jwt.SignOptions);

    // Calculate expiration in seconds
    const expiresIn = this.parseExpiresIn(config.jwtExpiresIn);

    return {
      success: true,
      token,
      expiresIn,
      userId: user._id.toString(),
      role: user.role,
    };
  }

  /**
   * Parse JWT expiration string to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
}

export const authService = new AuthService();
