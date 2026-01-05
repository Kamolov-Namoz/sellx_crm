import mongoose, { Document, Schema } from 'mongoose';

export type MessageType = 'text' | 'audio' | 'video' | 'image' | 'task';

export interface IProjectChat extends Document {
  projectId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId; // User who sent
  senderRole: 'user' | 'developer'; // seller yoki developer
  type: MessageType;
  content: string; // text yoki file URL
  taskId?: mongoose.Types.ObjectId; // Agar vazifa bo'lsa
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number; // audio/video uchun
    mimeType?: string;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectChatSchema = new Schema<IProjectChat>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['user', 'developer'], required: true },
    type: { type: String, enum: ['text', 'audio', 'video', 'image', 'task'], required: true },
    content: { type: String, required: true },
    taskId: { type: Schema.Types.ObjectId, ref: 'ProjectTask' },
    metadata: {
      fileName: String,
      fileSize: Number,
      duration: Number,
      mimeType: String,
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

projectChatSchema.index({ projectId: 1, createdAt: -1 });
projectChatSchema.index({ senderId: 1 });

export const ProjectChat = mongoose.model<IProjectChat>('ProjectChat', projectChatSchema);
