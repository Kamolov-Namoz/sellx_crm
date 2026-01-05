import mongoose, { Document } from 'mongoose';
export type NotificationType = 'chat_message' | 'new_task' | 'task_completed' | 'project_update';
export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    data?: {
        projectId?: string;
        taskId?: string;
        senderId?: string;
        senderName?: string;
    };
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=notification.model.d.ts.map