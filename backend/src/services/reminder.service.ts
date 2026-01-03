import { Types } from 'mongoose';
import { ScheduledReminder } from '../models';
import { notificationService } from './notification.service';

export class ReminderService {
  /**
   * Create a reminder for a client
   */
  async createReminder(userId: string, clientId: string, scheduledTime: Date) {
    // Cancel any existing pending reminders for this client
    await this.cancelRemindersByClient(clientId);

    // Create new reminder
    const reminder = await ScheduledReminder.create({
      userId: new Types.ObjectId(userId),
      clientId: new Types.ObjectId(clientId),
      scheduledTime,
      status: 'pending',
    });

    return reminder.toObject();
  }

  /**
   * Cancel all pending reminders for a client
   */
  async cancelRemindersByClient(clientId: string) {
    await ScheduledReminder.updateMany(
      {
        clientId: new Types.ObjectId(clientId),
        status: 'pending',
      },
      { status: 'cancelled' }
    );
  }

  /**
   * Update reminder time for a client
   */
  async updateReminder(clientId: string, newScheduledTime: Date) {
    const reminder = await ScheduledReminder.findOne({
      clientId: new Types.ObjectId(clientId),
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
   * Get pending reminders that are due
   */
  async getDueReminders() {
    const now = new Date();

    const reminders = await ScheduledReminder.find({
      scheduledTime: { $lte: now },
      status: 'pending',
    })
      .populate('clientId')
      .populate('userId')
      .lean();

    return reminders;
  }

  /**
   * Process due reminders - send notifications
   */
  async processDueReminders() {
    const dueReminders = await this.getDueReminders();

    const results = await Promise.allSettled(
      dueReminders.map(async (reminder) => {
        try {
          const client = reminder.clientId as unknown as { fullName: string; _id: Types.ObjectId };
          const user = reminder.userId as unknown as { fcmTokens: string[]; _id: Types.ObjectId };

          if (!client || !user) {
            throw new Error('Client or user not found');
          }

          // Send notification
          await notificationService.sendFollowUpNotification(
            user._id.toString(),
            user.fcmTokens,
            {
              clientId: client._id.toString(),
              clientName: client.fullName,
            }
          );

          // Mark reminder as sent
          await ScheduledReminder.updateOne(
            { _id: reminder._id },
            { status: 'sent' }
          );

          return { success: true, reminderId: reminder._id };
        } catch (error) {
          console.error(`Failed to process reminder ${reminder._id}:`, error);
          return { success: false, reminderId: reminder._id, error };
        }
      })
    );

    const processed = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { processed, failed, total: dueReminders.length };
  }

  /**
   * Get reminder count for a user
   */
  async getPendingReminderCount(userId: string) {
    return ScheduledReminder.countDocuments({
      userId: new Types.ObjectId(userId),
      status: 'pending',
    });
  }
}

export const reminderService = new ReminderService();
