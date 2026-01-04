import { Types } from 'mongoose';
export declare class ReminderService {
    /**
     * Create a reminder for a client
     */
    createReminder(userId: string, clientId: string, scheduledTime: Date): Promise<import("../models").ReminderDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    /**
     * Cancel all pending reminders for a client
     */
    cancelRemindersByClient(clientId: string): Promise<void>;
    /**
     * Update reminder time for a client
     */
    updateReminder(clientId: string, newScheduledTime: Date): Promise<(import("../models").ReminderDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    /**
     * Get pending reminders that are due (with limit for performance)
     */
    getDueReminders(limit?: number): Promise<(import("mongoose").FlattenMaps<import("../models").ReminderDocument> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    /**
     * Process due reminders - send notifications (batch processing)
     */
    processDueReminders(): Promise<{
        processed: number;
        failed: number;
        total: number;
    }>;
    /**
     * Get reminder count for a user
     */
    getPendingReminderCount(userId: string): Promise<number>;
}
export declare const reminderService: ReminderService;
//# sourceMappingURL=reminder.service.d.ts.map