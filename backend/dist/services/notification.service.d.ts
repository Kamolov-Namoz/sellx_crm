interface FollowUpNotificationData {
    clientId: string;
    clientName: string;
}
export declare class NotificationService {
    /**
     * Register push subscription for a user (Web Push uchun)
     */
    registerToken(userId: string, token: string): Promise<void>;
    /**
     * Remove push subscription for a user
     */
    removeToken(userId: string, token: string): Promise<void>;
    /**
     * Send follow-up notification (placeholder - frontend handles this now)
     */
    sendFollowUpNotification(userId: string, _tokens: string[], data: FollowUpNotificationData): Promise<{
        success: boolean;
        message: string;
        data: FollowUpNotificationData;
    }>;
    /**
     * Send custom notification (placeholder)
     */
    sendNotification(_tokens: string[], title: string, body: string, _data?: Record<string, string>): Promise<{
        success: boolean;
        message: string;
    }>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map