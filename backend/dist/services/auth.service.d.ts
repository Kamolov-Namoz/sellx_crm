import { AuthResponse, RegisterRequest } from '../types';
export declare class AuthService {
    /**
     * Validate password strength
     */
    private validatePassword;
    /**
     * Register a new user
     */
    register(data: RegisterRequest): Promise<AuthResponse>;
    /**
     * Login user and return JWT token
     */
    login(username: string, password: string): Promise<AuthResponse>;
    /**
     * Parse JWT expiration string to seconds
     */
    private parseExpiresIn;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map