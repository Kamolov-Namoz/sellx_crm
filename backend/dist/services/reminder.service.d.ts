export declare class ReminderService {
    /**
     * Create a reminder for a client
     */
    createReminder(userId: string, clientId: string, scheduledTime: Date): Promise<any>;
    /**
     * Cancel all pending reminders for a client
     */
    cancelRemindersByClient(clientId: string): Promise<void>;
    /**
     * Update reminder time for a client
     */
    updateReminder(clientId: string, newScheduledTime: Date): Promise<any>;
    /**
     * Get pending reminders that are due (with limit for performance)
     */
    getDueReminders(limit?: number): Promise<any>;
    /**
     * Process due reminders - send notifications (batch processing)
     */
    processDueReminders(): Promise<{
        processed: any;
        failed: any;
        total: any;
    }>;
    /**
     * Get reminder count for a user
     */
    getPendingReminderCount(userId: string): Promise<any>;
}
export declare const reminderService: ReminderService;
//# sourceMappingURL=reminder.service.d.ts.map