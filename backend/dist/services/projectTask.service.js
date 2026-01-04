"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectTaskService = exports.ProjectTaskService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../models");
class ProjectTaskService {
    async create(data) {
        const task = new models_1.ProjectTask({
            ...data,
            projectId: new mongoose_1.Types.ObjectId(data.projectId),
            employeeId: new mongoose_1.Types.ObjectId(data.employeeId),
        });
        return task.save();
    }
    async getByProject(projectId) {
        return models_1.ProjectTask.find({ projectId: new mongoose_1.Types.ObjectId(projectId) })
            .populate('employeeId', 'fullName position avatar')
            .sort({ createdAt: -1 });
    }
    async getByEmployee(employeeId) {
        return models_1.ProjectTask.find({ employeeId: new mongoose_1.Types.ObjectId(employeeId) })
            .populate('projectId', 'title status')
            .sort({ createdAt: -1 });
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
        const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0);
        const avgProgress = Math.round(totalProgress / tasks.length);
        // Agar barcha vazifalar tugagan bo'lsa, loyihani completed qilish
        const allCompleted = tasks.every(task => task.progress === 100);
        await models_1.Order.findByIdAndUpdate(projectId, {
            progress: avgProgress,
            ...(allCompleted && { status: 'completed' }),
        });
    }
    async getProjectProgress(projectId) {
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
exports.ProjectTaskService = ProjectTaskService;
exports.projectTaskService = new ProjectTaskService();
//# sourceMappingURL=projectTask.service.js.map