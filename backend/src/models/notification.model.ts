import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'new_task' | 'task_completed' | 'project_update';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // Kimga notification
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

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
      type: String, 
      enum: ['new_task', 'task_completed', 'project_update'], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      projectId: String,
      taskId: String,
      senderId: String,
      senderName: String,
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
