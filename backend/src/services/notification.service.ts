// Backend Notification Service (Firebase'siz - Web Push uchun tayyorlangan)
import { Types } from 'mongoose';
import { User } from '../models';

interface FollowUpNotificationData {
  clientId: string;
  clientName: string;
}

export class NotificationService {
  /**
   * Register push subscription for a user (Web Push uchun)
   */
  async registerToken(userId: string, token: string) {
    await User.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $addToSet: { fcmTokens: token } }
    );
  }

  /**
   * Remove push subscription for a user
   */
  async removeToken(userId: string, token: string) {
    await User.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $pull: { fcmTokens: token } }
    );
  }

  /**
   * Send follow-up notification (placeholder - frontend handles this now)
   */
  async sendFollowUpNotification(
    userId: string,
    _tokens: string[],
    data: FollowUpNotificationData
  ) {
    // Web Push notification - frontend'da browser notification ishlatiladi
    console.log(`Follow-up reminder for user ${userId}: ${data.clientName}`);
    return { 
      success: true, 
      message: 'Notification logged - frontend handles browser notifications',
      data 
    };
  }

  /**
   * Send custom notification (placeholder)
   */
  async sendNotification(
    _tokens: string[],
    title: string,
    body: string,
    _data?: Record<string, string>
  ) {
    console.log(`Notification: ${title} - ${body}`);
    return { 
      success: true, 
      message: 'Notification logged - frontend handles browser notifications' 
    };
  }
}

export const notificationService = new NotificationService();
