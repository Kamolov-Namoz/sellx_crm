import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectTask extends Document {
  projectId: mongoose.Types.ObjectId; // Order/Project
  milestoneId?: mongoose.Types.ObjectId; // Qaysi bosqichga tegishli
  developerId: mongoose.Types.ObjectId; // Developer (User with role='developer')
  title: string; // Vazifa nomi
  description?: string;
  // Tanlangan xizmat (agar loyihada xizmatlar bo'lsa)
  serviceId?: string;
  serviceName?: string;
  // Media attachments - audio/video/image
  attachments?: {
    type: 'audio' | 'video' | 'image';
    url: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    mimeType?: string;
  }[];
  progress: number; // 0-100 foiz
  status: 'in_progress' | 'completed';
  isAccepted: boolean; // Developer bajarib bo'lgandan keyin tasdiqlaydi
  acceptedAt?: Date; // Qachon tasdiqlangan
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectTaskSchema = new Schema<IProjectTask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    milestoneId: { type: Schema.Types.ObjectId }, // Bosqich ID
    developerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    serviceId: { type: String }, // Tanlangan xizmat ID
    serviceName: { type: String }, // Xizmat nomi
    attachments: [{
      type: { type: String, enum: ['audio', 'video', 'image'] },
      url: String,
      fileName: String,
      fileSize: Number,
      duration: Number,
      mimeType: String,
    }],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    isAccepted: { type: Boolean, default: false },
    acceptedAt: { type: Date },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

projectTaskSchema.index({ projectId: 1 });
projectTaskSchema.index({ projectId: 1, milestoneId: 1 });
projectTaskSchema.index({ developerId: 1 });

export const ProjectTask = mongoose.model<IProjectTask>('ProjectTask', projectTaskSchema);
