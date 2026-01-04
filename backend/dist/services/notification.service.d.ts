interface FollowUpNotificationData {
    clientId: string;
    clientName: string;
}
export declare class NotificationService {
    /**
     * Register FCM token for a user
     */
    registerToken(userId: string, token: string): Promise<void>;
    /**
     * Remove FCM token for a user
     */
    removeToken(userId: string, token: string): Promise<void>;
    /**
     * Send follow-up notification
     */
    sendFollowUpNotification(userId: string, tokens: string[], data: FollowUpNotificationData): Promise<{
        success: boolean;
        reason: string;
        successCount?: undefined;
        failureCount?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        successCount: any;
        failureCount: any;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        reason?: undefined;
        successCount?: undefined;
        failureCount?: undefined;
    }>;
    /**
     * Send custom notification
     */
    sendNotification(tokens: string[], title: string, body: string, data?: Record<string, string>): Promise<{
        success: boolean;
        reason: string;
        successCount?: undefined;
        failureCount?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        successCount: any;
        failureCount: any;
        reason?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: unknown;
        reason?: undefined;
        successCount?: undefined;
        failureCount?: undefined;
    }>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map