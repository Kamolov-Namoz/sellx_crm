import { Types } from 'mongoose';
import { ProjectTask, IProjectTask, Order } from '../models';
import { notificationService } from './notification.service';

export class ProjectTaskService {
  async create(data: Partial<IProjectTask>) {
    const task = new ProjectTask({
      ...data,
      projectId: new Types.ObjectId(data.projectId as unknown as string),
      milestoneId: data.milestoneId ? new Types.ObjectId(data.milestoneId as unknown as string) : undefined,
      developerId: new Types.ObjectId(data.developerId as unknown as string),
    });
    const savedTask = await task.save();
    
    // Notification yuborish
    try {
      const project = await Order.findById(data.projectId).populate('userId', 'firstName lastName');
      if (project) {
        const seller = project.userId as any;
        const sellerName = seller ? `${seller.firstName} ${seller.lastName}` : 'Seller';
        
        await notificationService.notifyNewTask({
          projectId: data.projectId as unknown as string,
          projectTitle: project.title,
          taskId: savedTask._id.toString(),
          taskTitle: savedTask.title,
          developerId: data.developerId as unknown as string,
          assignedBy: sellerName,
        });
      }
    } catch (err) {
      console.error('Notification yuborishda xatolik:', err);
    }
    
    return savedTask;
  }

  async getByProject(projectId: string) {
    return ProjectTask.find({ projectId: new Types.ObjectId(projectId) })
      .populate('developerId', 'firstName lastName username phoneNumber')
      .sort({ createdAt: -1 });
  }

  // Bosqich bo'yicha vazifalarni olish
  async getByMilestone(projectId: string, milestoneId: string) {
    return ProjectTask.find({ 
      projectId: new Types.ObjectId(projectId),
      milestoneId: new Types.ObjectId(milestoneId)
    })
      .populate('developerId', 'firstName lastName username phoneNumber')
      .sort({ createdAt: -1 });
  }

  // Bosqich progressini hisoblash
  async getMilestoneProgress(projectId: string, milestoneId: string) {
    const tasks = await this.getByMilestone(projectId, milestoneId);
    const acceptedTasks = tasks.filter(t => t.isAccepted).length;
    const avgProgress = tasks.length > 0 ? Math.round((acceptedTasks / tasks.length) * 100) : 0;
    
    // Unique dasturchilar
    const developers = new Map();
    tasks.forEach(task => {
      const dev = task.developerId as any;
      if (dev && dev._id && !developers.has(dev._id.toString())) {
        developers.set(dev._id.toString(), {
          _id: dev._id,
          firstName: dev.firstName,
          lastName: dev.lastName,
          username: dev.username,
          phoneNumber: dev.phoneNumber,
        });
      }
    });
    
    return {
      tasks,
      totalTasks: tasks.length,
      completedTasks: acceptedTasks,
      avgProgress,
      developers: Array.from(developers.values()),
    };
  }

  async getByDeveloper(developerId: string) {
    return ProjectTask.find({ developerId: new Types.ObjectId(developerId) })
      .populate({
        path: 'projectId',
        select: 'title status clientId amount description createdAt',
        populate: {
          path: 'clientId',
          select: 'fullName companyName phoneNumber'
        }
      })
      .sort({ createdAt: -1 });
  }

  // Developer loyihalarini olish (unique projects)
  async getDeveloperProjects(developerId: string) {
    const tasks = await ProjectTask.find({ developerId: new Types.ObjectId(developerId) })
      .populate({
        path: 'projectId',
        select: 'title status clientId amount description createdAt progress',
        populate: {
          path: 'clientId',
          select: 'fullName companyName'
        }
      });
    
    // Unique loyihalarni olish
    const projectMap = new Map();
    tasks.forEach(task => {
      const project = task.projectId as any;
      if (project && !projectMap.has(project._id.toString())) {
        const projectTasks = tasks.filter(t => 
          (t.projectId as any)?._id?.toString() === project._id.toString()
        );
        const completedTasks = projectTasks.filter(t => t.isAccepted).length;
        const totalTasks = projectTasks.length;
        
        projectMap.set(project._id.toString(), {
          ...project.toObject(),
          myTasks: totalTasks,
          completedTasks,
          myProgress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        });
      }
    });
    
    return Array.from(projectMap.values());
  }

  // Developer uchun statistika
  async getDeveloperStats(developerId: string) {
    const tasks = await ProjectTask.find({ developerId: new Types.ObjectId(developerId) })
      .populate('projectId', 'title status');
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isAccepted).length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress' && !t.isAccepted).length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    // Unique loyihalar
    const uniqueProjects = new Set(tasks.map(t => t.projectId?.toString()).filter(Boolean));
    const completedProjects = new Set(
      tasks.filter(t => (t.projectId as any)?.status === 'completed')
        .map(t => t.projectId?.toString())
    );
    
    const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0);
    const avgProgress = totalTasks > 0 ? Math.round(totalProgress / totalTasks) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      avgProgress,
      totalProjects: uniqueProjects.size,
      completedProjects: completedProjects.size,
    };
  }

  // Portfolio - tugallangan ishlar
  async getDeveloperPortfolio(developerId: string) {
    const tasks = await ProjectTask.find({ 
      developerId: new Types.ObjectId(developerId),
      isAccepted: true 
    })
      .populate({
        path: 'projectId',
        select: 'title status clientId amount createdAt',
        populate: {
          path: 'clientId',
          select: 'fullName companyName'
        }
      })
      .sort({ acceptedAt: -1 });
    
    // Har bir vazifa uchun bajarish tezligini hisoblash
    return tasks.map(task => {
      const createdAt = new Date(task.createdAt);
      const acceptedAt = task.acceptedAt ? new Date(task.acceptedAt) : new Date();
      const daysToComplete = Math.ceil((acceptedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        project: task.projectId,
        completedAt: task.acceptedAt,
        daysToComplete,
        createdAt: task.createdAt,
      };
    });
  }

  // Vazifani tasdiqlash (Accept)
  async acceptTask(taskId: string, developerId: string) {
    const task = await ProjectTask.findOne({
      _id: new Types.ObjectId(taskId),
      developerId: new Types.ObjectId(developerId),
    }).populate('developerId', 'firstName lastName');
    
    if (!task) {
      throw new Error('Vazifa topilmadi');
    }
    
    task.progress = 100;
    task.status = 'completed';
    task.isAccepted = true;
    task.acceptedAt = new Date();
    await task.save();
    
    // Loyiha progressini yangilash
    await this.updateProjectProgress(task.projectId.toString());
    
    // Seller ga notification yuborish
    try {
      const project = await Order.findById(task.projectId);
      if (project) {
        const developer = task.developerId as any;
        const developerName = developer ? `${developer.firstName} ${developer.lastName}` : 'Dasturchi';
        
        await notificationService.notifyTaskCompleted({
          projectId: task.projectId.toString(),
          projectTitle: project.title,
          taskId: task._id.toString(),
          taskTitle: task.title,
          developerId: developerId,
          developerName,
          sellerId: project.userId.toString(),
        });
      }
    } catch (err) {
      console.error('Notification yuborishda xatolik:', err);
    }
    
    return task;
  }

  async update(id: string, data: Partial<IProjectTask>) {
    const task = await ProjectTask.findByIdAndUpdate(id, data, { new: true });
    
    // Agar progress 100% bo'lsa, status ni completed qilish
    if (task && data.progress === 100) {
      task.status = 'completed';
      await task.save();
    }
    
    // Loyihaning umumiy progressini hisoblash
    if (task) {
      await this.updateProjectProgress(task.projectId.toString());
    }
    
    return task;
  }

  async delete(id: string) {
    const task = await ProjectTask.findByIdAndDelete(id);
    if (task) {
      await this.updateProjectProgress(task.projectId.toString());
    }
    return task;
  }

  // Loyihaning umumiy progressini hisoblash
  async updateProjectProgress(projectId: string) {
    const tasks = await ProjectTask.find({ projectId: new Types.ObjectId(projectId) });
    
    if (tasks.length === 0) return;
    
    const acceptedTasks = tasks.filter(t => t.isAccepted).length;
    const avgProgress = Math.round((acceptedTasks / tasks.length) * 100);
    
    // Agar barcha vazifalar tasdiqlangan bo'lsa, loyihani completed qilish
    const allAccepted = tasks.every(task => task.isAccepted);
    
    await Order.findByIdAndUpdate(projectId, {
      progress: avgProgress,
      ...(allAccepted && { status: 'completed' }),
    });
  }

  async getProjectProgress(projectId: string) {
    const tasks = await this.getByProject(projectId);
    const acceptedTasks = tasks.filter(t => t.isAccepted).length;
    const avgProgress = tasks.length > 0 ? Math.round((acceptedTasks / tasks.length) * 100) : 0;
    
    return {
      tasks,
      totalTasks: tasks.length,
      completedTasks: acceptedTasks,
      avgProgress,
    };
  }
}

export const projectTaskService = new ProjectTaskService();
