import { Types } from 'mongoose';
import { IProjectTask } from '../models';
export declare class ProjectTaskService {
    create(data: Partial<IProjectTask>): Promise<import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getByProject(projectId: string): Promise<(import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getByDeveloper(developerId: string): Promise<(import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getDeveloperProjects(developerId: string): Promise<any[]>;
    getDeveloperStats(developerId: string): Promise<{
        totalTasks: number;
        completedTasks: number;
        inProgressTasks: number;
        pendingTasks: number;
        avgProgress: number;
        totalProjects: number;
        completedProjects: number;
    }>;
    getDeveloperPortfolio(developerId: string): Promise<{
        _id: Types.ObjectId;
        title: string;
        description: string | undefined;
        project: Types.ObjectId;
        completedAt: Date | undefined;
        daysToComplete: number;
        createdAt: Date;
    }[]>;
    acceptTask(taskId: string, developerId: string): Promise<import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(id: string, data: Partial<IProjectTask>): Promise<(import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    delete(id: string): Promise<(import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateProjectProgress(projectId: string): Promise<void>;
    getProjectProgress(projectId: string): Promise<{
        tasks: (import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        totalTasks: number;
        completedTasks: number;
        avgProgress: number;
    }>;
}
export declare const projectTaskService: ProjectTaskService;
//# sourceMappingURL=projectTask.service.d.ts.map