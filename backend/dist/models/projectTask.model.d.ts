import mongoose, { Document } from 'mongoose';
export interface IProjectTask extends Document {
    projectId: mongoose.Types.ObjectId;
    developerId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    attachments?: {
        type: 'audio' | 'video' | 'image';
        url: string;
        fileName?: string;
        fileSize?: number;
        duration?: number;
        mimeType?: string;
    }[];
    progress: number;
    status: 'pending' | 'in_progress' | 'completed';
    isAccepted: boolean;
    acceptedAt?: Date;
    dueDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProjectTask: mongoose.Model<IProjectTask, {}, {}, {}, mongoose.Document<unknown, {}, IProjectTask, {}, {}> & IProjectTask & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=projectTask.model.d.ts.map