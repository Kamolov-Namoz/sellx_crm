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
    getByEmployee(employeeId: string): Promise<(import("mongoose").Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
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