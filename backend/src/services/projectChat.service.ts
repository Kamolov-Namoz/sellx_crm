import { Types } from 'mongoose';
import { ProjectChat, Order, ProjectTask } from '../models';
import { notificationService } from './notification.service';

export class ProjectChatService {
  // Xabar yuborish
  async sendMessage(data: {
    projectId: string;
    senderId: string;
    senderRole: 'user' | 'developer';
    type: 'text' | 'audio' | 'video' | 'image' | 'task';
    content: string;
    taskId?: string;
    metadata?: {
      fileName?: string;
      fileSize?: number;
      duration?: number;
      mimeType?: string;
    };
  }) {
    const message = new ProjectChat({
      projectId: new Types.ObjectId(data.projectId),
      senderId: new Types.ObjectId(data.senderId),
      senderRole: data.senderRole,
      type: data.type,
      content: data.content,
      taskId: data.taskId ? new Types.ObjectId(data.taskId) : undefined,
      metadata: data.metadata,
    });
    
    await message.save();
    
    // Populate sender info
    const populatedMessage = await message.populate('senderId', 'firstName lastName username');
    
    // Notification yuborish
    try {
      const sender = populatedMessage.senderId as any;
      const project = await Order.findById(data.projectId).select('title');
      
      if (project && sender) {
        const senderName = `${sender.firstName} ${sender.lastName}`;
        const messagePreview = data.type === 'text' ? data.content : 
          data.type === 'image' ? '📷 Rasm' : 
          data.type === 'video' ? '🎥 Video' : 
          data.type === 'audio' ? '🎵 Audio' : 
          data.type === 'task' ? '📋 Vazifa' : 'Xabar';
        
        await notificationService.notifyChatMessage({
          projectId: data.projectId,
          projectTitle: project.title,
          senderId: data.senderId,
          senderName,
          senderRole: data.senderRole,
          messagePreview,
        });
      }
    } catch (err) {
      console.error('Notification yuborishda xatolik:', err);
    }
    
    return populatedMessage;
  }

  // Loyiha xabarlarini olish
  async getMessages(projectId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
      ProjectChat.find({ projectId: new Types.ObjectId(projectId) })
        .populate('senderId', 'firstName lastName username role')
        .populate('taskId', 'title status isAccepted')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProjectChat.countDocuments({ projectId: new Types.ObjectId(projectId) }),
    ]);
    
    return {
      messages: messages.reverse(), // Eng eski birinchi
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Xabarlarni o'qilgan deb belgilash
  async markAsRead(projectId: string, userId: string) {
    await ProjectChat.updateMany(
      {
        projectId: new Types.ObjectId(projectId),
        senderId: { $ne: new Types.ObjectId(userId) },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  // O'qilmagan xabarlar soni
  async getUnreadCount(projectId: string, userId: string) {
    return ProjectChat.countDocuments({
      projectId: new Types.ObjectId(projectId),
      senderId: { $ne: new Types.ObjectId(userId) },
      isRead: false,
    });
  }

  // Developer uchun barcha loyihalardan o'qilmagan xabarlar
  async getDeveloperUnreadCounts(developerId: string) {
    // Developer qaysi loyihalarda ishtirok etayotganini topish
    const tasks = await ProjectTask.find({ 
      developerId: new Types.ObjectId(developerId) 
    }).distinct('projectId');
    
    const counts = await ProjectChat.aggregate([
      {
        $match: {
          projectId: { $in: tasks },
          senderId: { $ne: new Types.ObjectId(developerId) },
          isRead: false,
        },
      },
      {
        $group: {
          _id: '$projectId',
          count: { $sum: 1 },
        },
      },
    ]);
    
    return counts;
  }

  // Loyiha ma'lumotlari (chat uchun)
  async getProjectInfo(projectId: string) {
    const project = await Order.findById(projectId)
      .populate('clientId', 'fullName companyName')
      .populate('userId', 'firstName lastName')
      .lean();
    
    if (!project) return null;
    
    // Loyihadagi vazifalar va dasturchilar
    const tasks = await ProjectTask.find({ projectId: new Types.ObjectId(projectId) })
      .populate('developerId', 'firstName lastName username')
      .lean();
    
    // Unique developers
    const developers = [...new Map(
      tasks
        .filter(t => t.developerId)
        .map(t => [(t.developerId as any)._id.toString(), t.developerId])
    ).values()];
    
    const completedTasks = tasks.filter(t => t.isAccepted).length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    
    return {
      ...project,
      tasks,
      developers,
      totalTasks: tasks.length,
      completedTasks,
      progress,
    };
  }
}

export const projectChatService = new ProjectChatService();
