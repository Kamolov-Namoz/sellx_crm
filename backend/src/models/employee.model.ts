import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployee extends Document {
  userId: mongoose.Types.ObjectId; // Qaysi admin yaratgan
  fullName: string;
  position: string; // Lavozimi
  phoneNumber?: string;
  email?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    position: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

employeeSchema.index({ userId: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
