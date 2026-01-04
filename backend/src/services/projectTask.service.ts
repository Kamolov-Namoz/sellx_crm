import { Types } from 'mongoose';
import { ProjectTask, IProjectTask, Order } from '../models';

export class ProjectTaskService {
  async create(data: Partial<IProjectTask>) {
    const task = new ProjectTask({
      ...data,
      projectId: new Types.ObjectId(data.projectId as unknown as string),
      employeeId: new Types.ObjectId(data.employeeId as unknown as string),
    });
    return task.save();
  }

  async getByProject(projectId: string) {
    return ProjectTask.find({ projectId: new Types.ObjectId(projectId) })
      .populate('employeeId', 'fullName position avatar')
      .sort({ createdAt: -1 });
  }

  async getByEmployee(employeeId: string) {
    return ProjectTask.find({ employeeId: new Types.ObjectId(employeeId) })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });
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
    
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    const avgProgress = Math.round(totalProgress / tasks.length);
    
    // Agar barcha vazifalar tugagan bo'lsa, loyihani completed qilish
    const allCompleted = tasks.every(task => task.progress === 100);
    
    await Order.findByIdAndUpdate(projectId, {
      progress: avgProgress,
      ...(allCompleted && { status: 'completed' }),
    });
  }

  async getProjectProgress(projectId: string) {
    const tasks = await this.getByProject(projectId);
    const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
    const avgProgress = tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;
    
    return {
      tasks,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.progress === 100).length,
      avgProgress,
    };
  }
}

export const projectTaskService = new ProjectTaskService();
