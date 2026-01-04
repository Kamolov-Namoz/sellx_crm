"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reminderService = exports.ReminderService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const notification_service_1 = require("./notification.service");
class ReminderService {
    /**
     * Create a reminder for a client
     */
    async createReminder(userId, clientId, scheduledTime) {
        // Cancel any existing pending reminders for this client
        await this.cancelRemindersByClient(clientId);
        // Create new reminder
        const reminder = await models_1.ScheduledReminder.create({
            userId: new mongoose_1.Types.ObjectId(userId),
            clientId: new mongoose_1.Types.ObjectId(clientId),
            scheduledTime,
            status: 'pending',
        });
        return reminder.toObject();
    }
    /**
     * Cancel all pending reminders for a client
     */
    async cancelRemindersByClient(clientId) {
        await models_1.ScheduledReminder.updateMany({
            clientId: new mongoose_1.Types.ObjectId(clientId),
            status: 'pending',
        }, { status: 'cancelled' });
    }
    /**
     * Update reminder time for a client
     */
    async updateReminder(clientId, newScheduledTime) {
        const reminder = await models_1.ScheduledReminder.findOne({
            clientId: new mongoose_1.Types.ObjectId(clientId),
            status: 'pending',
        });
        if (reminder) {
            reminder.scheduledTime = newScheduledTime;
            await reminder.save();
            return reminder.toObject();
        }
        return null;
    }
    /**
     * Get pending reminders that are due (with limit for performance)
     */
    async getDueReminders(limit = 100) {
        const now = new Date();
        const reminders = await models_1.ScheduledReminder.find({
            scheduledTime: { $lte: now },
            status: 'pending',
        })
            .limit(limit)
            .populate('clientId')
            .populate('userId')
            .lean();
        return reminders;
    }
    /**
     * Process due reminders - send notifications (batch processing)
     */
    async processDueReminders() {
        const dueReminders = await this.getDueReminders(50); // Process max 50 at a time
        const results = await Promise.allSettled(dueReminders.map(async (reminder) => {
            try {
                const client = reminder.clientId;
                const user = reminder.userId;
                if (!client || !user) {
                    throw new Error('Client or user not found');
                }
                // Send notification
                await notification_service_1.notificationService.sendFollowUpNotification(user._id.toString(), user.fcmTokens, {
                    clientId: client._id.toString(),
                    clientName: client.fullName,
                });
                // Mark reminder as sent
                await models_1.ScheduledReminder.updateOne({ _id: reminder._id }, { status: 'sent' });
                return { success: true, reminderId: reminder._id };
            }
            catch (error) {
                console.error(`Failed to process reminder ${reminder._id}:`, error);
                return { success: false, reminderId: reminder._id, error };
            }
        }));
        const processed = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;
        return { processed, failed, total: dueReminders.length };
    }
    /**
     * Get reminder count for a user
     */
    async getPendingReminderCount(userId) {
        return models_1.ScheduledReminder.countDocuments({
            userId: new mongoose_1.Types.ObjectId(userId),
            status: 'pending',
        });
    }
}
exports.ReminderService = ReminderService;
exports.reminderService = new ReminderService();
//# sourceMappingURL=reminder.service.js.map