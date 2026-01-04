import { Document } from 'mongoose';
import { Types } from 'mongoose';
import { ConversationType } from '../types';
export interface IConversation {
    _id: Types.ObjectId;
    clientId: Types.ObjectId;
    userId: Types.ObjectId;
    type: ConversationType;
    content: string;
    summary: string;
    nextFollowUpDate: Date;
    metadata?: {
        fileName?: string;
        fileSize?: number;
        duration?: number;
        mimeType?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface ConversationDocument extends Omit<IConversation, '_id'>, Document {
}
export declare const Conversation: any;
//# sourceMappingURL=conversation.model.d.ts.map