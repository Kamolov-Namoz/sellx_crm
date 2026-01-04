import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectTask extends Document {
  projectId: mongoose.Types.ObjectId; // Order/Project
  employeeId: mongoose.Types.ObjectId; // Xodim
  title: string; // Vazifa nomi
  description?: string;
  progress: number; // 0-100 foiz
  status: 'pending' | 'in_progress' | 'completed';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const projectTaskSchema = new Schema<IProjectTask>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    title: { type: String, required: true },
    description: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

projectTaskSchema.index({ projectId: 1 });
projectTaskSchema.index({ employeeId: 1 });

export const ProjectTask = mongoose.model<IProjectTask>('ProjectTask', projectTaskSchema);
