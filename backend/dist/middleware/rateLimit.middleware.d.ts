import { Request, Response, NextFunction } from 'express';
interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}
export declare const rateLimit: (options: RateLimitOptions) => (req: Request, _res: Response, next: NextFunction) => void;
export declare const authRateLimit: (req: Request, _res: Response, next: NextFunction) => void;
export declare const apiRateLimit: (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=rateLimit.middleware.d.ts.map