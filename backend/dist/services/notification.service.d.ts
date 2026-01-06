import { Types } from 'mongoose';
export declare class NotificationService {
    create(data: {
        userId: string;
        type: 'new_task' | 'task_completed' | 'project_update';
        title: string;
        message: string;
        data?: {
            projectId?: string;
            taskId?: string;
            senderId?: string;
            senderName?: string;
        };
    }): Promise<import("mongoose").Document<unknown, {}, import("../models").INotification, {}, {}> & import("../models").INotification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getByUser(userId: string, page?: number, limit?: number): Promise<{
        notifications: (import("mongoose").FlattenMaps<import("../models").INotification> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        totalPages: number;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<(import("mongoose").Document<unknown, {}, import("../models").INotification, {}, {}> & import("../models").INotification & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    markAllAsRead(userId: string): Promise<import("mongoose").UpdateWriteOpResult>;
    notifyNewTask(data: {
        projectId: string;
        projectTitle: string;
        taskId: string;
        taskTitle: string;
        developerId: string;
        assignedBy: string;
    }): Promise<void>;
    notifyTaskCompleted(data: {
        projectId: string;
        projectTitle: string;
        taskId: string;
        taskTitle: string;
        developerId: string;
        developerName: string;
        sellerId: string;
    }): Promise<void>;
    registerToken(userId: string, token: string): Promise<void>;
    removeToken(userId: string, token: string): Promise<void>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=notification.service.d.ts.map