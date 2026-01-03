import admin from 'firebase-admin';
import { Types } from 'mongoose';
import { config } from '../config';
import { User } from '../models';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;
let firebaseInitError: Error | null = null;

function initializeFirebase() {
  if (firebaseInitialized) return;

  if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          privateKey: config.firebase.privateKey,
          clientEmail: config.firebase.clientEmail,
        }),
      });
      firebaseInitialized = true;
      console.warn('Firebase Admin SDK initialized');
    } catch (error) {
      firebaseInitError = error as Error;
      console.error('Failed to initialize Firebase:', error);
    }
  } else {
    console.warn('Firebase credentials not configured - push notifications disabled');
  }
}

// Initialize on module load
initializeFirebase();

interface FollowUpNotificationData {
  clientId: string;
  clientName: string;
}

export class NotificationService {
  /**
   * Register FCM token for a user
   */
  async registerToken(userId: string, token: string) {
    await User.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $addToSet: { fcmTokens: token } }
    );
  }

  /**
   * Remove FCM token for a user
   */
  async removeToken(userId: string, token: string) {
    await User.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $pull: { fcmTokens: token } }
    );
  }

  /**
   * Send follow-up notification
   */
  async sendFollowUpNotification(
    userId: string,
    tokens: string[],
    data: FollowUpNotificationData
  ) {
    if (!firebaseInitialized) {
      const reason = firebaseInitError ? 'init_error' : 'not_configured';
      console.warn(`Skipping notification - Firebase ${reason}`);
      return { success: false, reason };
    }
    
    if (tokens.length === 0) {
      console.warn('Skipping notification - no FCM tokens');
      return { success: false, reason: 'no_tokens' };
    }

    const message = {
      notification: {
        title: 'Follow-up eslatmasi',
        body: `${data.clientName} bilan bog'lanish vaqti keldi`,
      },
      data: {
        clientId: data.clientId,
        clientName: data.clientName,
        action: 'open_client',
      },
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);

      // Remove invalid tokens
      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errorCode = resp.error?.code;
            if (
              errorCode === 'messaging/invalid-registration-token' ||
              errorCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });

        // Remove invalid tokens from user
        if (invalidTokens.length > 0) {
          await User.updateOne(
            { _id: new Types.ObjectId(userId) },
            { $pull: { fcmTokens: { $in: invalidTokens } } }
          );
        }
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false, error };
    }
  }

  /**
   * Send custom notification
   */
  async sendNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ) {
    if (!firebaseInitialized) {
      return { success: false, reason: firebaseInitError ? 'init_error' : 'not_configured' };
    }
    
    if (tokens.length === 0) {
      return { success: false, reason: 'no_tokens' };
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false, error };
    }
  }
}

export const notificationService = new NotificationService();
