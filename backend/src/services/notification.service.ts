import { Types } from 'mongoose';
import { User, Notification, ProjectTask } from '../models';

export class NotificationService {
  // Notification yaratish
  async create(data: {
    userId: string;
    type: 'chat_message' | 'new_task' | 'task_completed' | 'project_update';
    title: string;
    message: string;
    data?: {
      projectId?: string;
      taskId?: string;
      senderId?: string;
      senderName?: string;
    };
  }) {
    const notification = new Notification({
      userId: new Types.ObjectId(data.userId),
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
    });
    return notification.save();
  }

  // User notificationlarini olish
  async getByUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId: new Types.ObjectId(userId) }),
      Notification.countDocuments({ userId: new Types.ObjectId(userId), isRead: false }),
    ]);
    
    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // O'qilmagan notificationlar soni
  async getUnreadCount(userId: string) {
    return Notification.countDocuments({ 
      userId: new Types.ObjectId(userId), 
      isRead: false 
    });
  }

  // Notificationni o'qilgan deb belgilash
  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { 
        _id: new Types.ObjectId(notificationId), 
        userId: new Types.ObjectId(userId) 
      },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  }

  // Barcha notificationlarni o'qilgan deb belgilash
  async markAllAsRead(userId: string) {
    return Notification.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  // Chat xabari uchun notification
  async notifyChatMessage(data: {
    projectId: string;
    projectTitle: string;
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'developer';
    messagePreview: string;
  }) {
    // Loyihadagi barcha ishtirokchilarni topish
    const tasks = await ProjectTask.find({ 
      projectId: new Types.ObjectId(data.projectId) 
    }).populate('developerId', '_id');
    
    // Unique developer IDs
    const developerIds = [...new Set(
      tasks
        .filter(t => t.developerId)
        .map(t => (t.developerId as any)._id.toString())
    )];
    
    // Agar sender developer bo'lsa, seller ga notification
    // Agar sender seller bo'lsa, developerlarga notification
    if (data.senderRole === 'developer') {
      // Seller ga notification - loyiha egasini topish kerak
      // Bu yerda Order modelidan userId ni olish kerak
      const { Order } = await import('../models');
      const order = await Order.findById(data.projectId);
      if (order && order.userId.toString() !== data.senderId) {
        await this.create({
          userId: order.userId.toString(),
          type: 'chat_message',
          title: `${data.senderName} xabar yubordi`,
          message: `${data.projectTitle}: ${data.messagePreview.substring(0, 50)}...`,
          data: {
            projectId: data.projectId,
            senderId: data.senderId,
            senderName: data.senderName,
          },
        });
      }
    } else {
      // Developerlarga notification
      for (const devId of developerIds) {
        if (devId !== data.senderId) {
          await this.create({
            userId: devId,
            type: 'chat_message',
            title: `${data.senderName} xabar yubordi`,
            message: `${data.projectTitle}: ${data.messagePreview.substring(0, 50)}...`,
            data: {
              projectId: data.projectId,
              senderId: data.senderId,
              senderName: data.senderName,
            },
          });
        }
      }
    }
  }

  // Yangi vazifa uchun notification
  async notifyNewTask(data: {
    projectId: string;
    projectTitle: string;
    taskId: string;
    taskTitle: string;
    developerId: string;
    assignedBy: string;
  }) {
    await this.create({
      userId: data.developerId,
      type: 'new_task',
      title: 'Yangi vazifa',
      message: `${data.projectTitle}: ${data.taskTitle}`,
      data: {
        projectId: data.projectId,
        taskId: data.taskId,
        senderName: data.assignedBy,
      },
    });
  }

  // Vazifa tasdiqlanganda notification
  async notifyTaskCompleted(data: {
    projectId: string;
    projectTitle: string;
    taskId: string;
    taskTitle: string;
    developerId: string;
    developerName: string;
    sellerId: string;
  }) {
    await this.create({
      userId: data.sellerId,
      type: 'task_completed',
      title: 'Vazifa bajarildi',
      message: `${data.developerName} "${data.taskTitle}" vazifasini bajardi`,
      data: {
        projectId: data.projectId,
        taskId: data.taskId,
        senderId: data.developerId,
        senderName: data.developerName,
      },
    });
  }

  // FCM token registration (Web Push uchun)
  async registerToken(userId: string, token: string) {
    await User.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $addToSet: { fcmTokens: token } }
    );
  }

  async removeToken(userId: string, token: string) {
    await User.updateOne(
      { _id: new Types.ObjectId(userId) },
      { $pull: { fcmTokens: token } }
    );
  }
}

export const notificationService = new NotificationService();
