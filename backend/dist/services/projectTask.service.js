"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectTaskService = exports.ProjectTaskService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
const notification_service_1 = require("./notification.service");
class ProjectTaskService {
    async create(data) {
        const task = new models_1.ProjectTask({
            ...data,
            projectId: new mongoose_1.Types.ObjectId(data.projectId),
            milestoneId: data.milestoneId ? new mongoose_1.Types.ObjectId(data.milestoneId) : undefined,
            developerId: new mongoose_1.Types.ObjectId(data.developerId),
        });
        const savedTask = await task.save();
        // Notification yuborish
        try {
            const project = await models_1.Order.findById(data.projectId).populate('userId', 'firstName lastName');
            if (project) {
                const seller = project.userId;
                const sellerName = seller ? `${seller.firstName} ${seller.lastName}` : 'Seller';
                await notification_service_1.notificationService.notifyNewTask({
                    projectId: data.projectId,
                    projectTitle: project.title,
                    taskId: savedTask._id.toString(),
                    taskTitle: savedTask.title,
                    developerId: data.developerId,
                    assignedBy: sellerName,
                });
            }
        }
        catch (err) {
            console.error('Notification yuborishda xatolik:', err);
        }
        return savedTask;
    }
    async getByProject(projectId) {
        return models_1.ProjectTask.find({ projectId: new mongoose_1.Types.ObjectId(projectId) })
            .populate('developerId', 'firstName lastName username phoneNumber')
            .sort({ createdAt: -1 });
    }
    // Bosqich bo'yicha vazifalarni olish
    async getByMilestone(projectId, milestoneId) {
        return models_1.ProjectTask.find({
            projectId: new mongoose_1.Types.ObjectId(projectId),
            milestoneId: new mongoose_1.Types.ObjectId(milestoneId)
        })
            .populate('developerId', 'firstName lastName username phoneNumber')
            .sort({ createdAt: -1 });
    }
    // Bosqich progressini hisoblash
    async getMilestoneProgress(projectId, milestoneId) {
        const tasks = await this.getByMilestone(projectId, milestoneId);
        const acceptedTasks = tasks.filter(t => t.isAccepted).length;
        const avgProgress = tasks.length > 0 ? Math.round((acceptedTasks / tasks.length) * 100) : 0;
        // Unique dasturchilar
        const developers = new Map();
        tasks.forEach(task => {
            const dev = task.developerId;
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
    async getByDeveloper(developerId) {
        return models_1.ProjectTask.find({ developerId: new mongoose_1.Types.ObjectId(developerId) })
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
    async getDeveloperProjects(developerId) {
        const tasks = await models_1.ProjectTask.find({ developerId: new mongoose_1.Types.ObjectId(developerId) })
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
            const project = task.projectId;
            if (project && !projectMap.has(project._id.toString())) {
                const projectTasks = tasks.filter(t => t.projectId?._id?.toString() === project._id.toString());
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
    async getDeveloperStats(developerId) {
        const tasks = await models_1.ProjectTask.find({ developerId: new mongoose_1.Types.ObjectId(developerId) })
            .populate('projectId', 'title status');
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.isAccepted).length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress' && !t.isAccepted).length;
        const pendingTasks = tasks.filter(t => t.status === 'pending').length;
        // Unique loyihalar
        const uniqueProjects = new Set(tasks.map(t => t.projectId?.toString()).filter(Boolean));
        const completedProjects = new Set(tasks.filter(t => t.projectId?.status === 'completed')
            .map(t => t.projectId?.toString()));
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
    async getDeveloperPortfolio(developerId) {
        const tasks = await models_1.ProjectTask.find({
            developerId: new mongoose_1.Types.ObjectId(developerId),
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
    async acceptTask(taskId, developerId) {
        const task = await models_1.ProjectTask.findOne({
            _id: new mongoose_1.Types.ObjectId(taskId),
            developerId: new mongoose_1.Types.ObjectId(developerId),
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
            const project = await models_1.Order.findById(task.projectId);
            if (project) {
                const developer = task.developerId;
                const developerName = developer ? `${developer.firstName} ${developer.lastName}` : 'Dasturchi';
                await notification_service_1.notificationService.notifyTaskCompleted({
                    projectId: task.projectId.toString(),
                    projectTitle: project.title,
                    taskId: task._id.toString(),
                    taskTitle: task.title,
                    developerId: developerId,
                    developerName,
                    sellerId: project.userId.toString(),
                });
            }
        }
        catch (err) {
            console.error('Notification yuborishda xatolik:', err);
        }
        return task;
    }
    async update(id, data) {
        const task = await models_1.ProjectTask.findByIdAndUpdate(id, data, { new: true });
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
    async delete(id) {
        const task = await models_1.ProjectTask.findByIdAndDelete(id);
        if (task) {
            await this.updateProjectProgress(task.projectId.toString());
        }
        return task;
    }
    // Loyihaning umumiy progressini hisoblash
    async updateProjectProgress(projectId) {
        const tasks = await models_1.ProjectTask.find({ projectId: new mongoose_1.Types.ObjectId(projectId) });
        if (tasks.length === 0)
            return;
        const acceptedTasks = tasks.filter(t => t.isAccepted).length;
        const avgProgress = Math.round((acceptedTasks / tasks.length) * 100);
        // Agar barcha vazifalar tasdiqlangan bo'lsa, loyihani completed qilish
        const allAccepted = tasks.every(task => task.isAccepted);
        await models_1.Order.findByIdAndUpdate(projectId, {
            progress: avgProgress,
            ...(allAccepted && { status: 'completed' }),
        });
    }
    async getProjectProgress(projectId) {
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
exports.ProjectTaskService = ProjectTaskService;
exports.projectTaskService = new ProjectTaskService();
//# sourceMappingURL=projectTask.service.js.map