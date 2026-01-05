import mongoose, { Document } from 'mongoose';
export type MessageType = 'text' | 'audio' | 'video' | 'image' | 'task';
export interface IProjectChat extends Document {
    projectId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    senderRole: 'user' | 'developer';
    type: MessageType;
    content: string;
    taskId?: mongoose.Types.ObjectId;
    metadata?: {
        fileName?: string;
        fileSize?: number;
        duration?: number;
        mimeType?: string;
    };
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProjectChat: mongoose.Model<IProjectChat, {}, {}, {}, mongoose.Document<unknown, {}, IProjectChat, {}, {}> & IProjectChat & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=projectChat.model.d.ts.map