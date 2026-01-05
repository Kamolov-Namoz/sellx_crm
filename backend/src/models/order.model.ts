import mongoose, { Schema, Document } from 'mongoose';
import { IOrder, OrderStatus } from '../types';

// Bosqich (Milestone) interfeysi
export interface IMilestone {
  _id?: mongoose.Types.ObjectId;
  title: string; // Bosqich nomi (masalan: "Avans", "Dizayn", "Yakuniy to'lov")
  description?: string; // Bajariladigan ishlar tavsifi
  amount: number; // Bu bosqichdagi to'lov miqdori
  percentage: number; // Umumiy summadan foiz (masalan: 30%)
  dueDate?: Date; // Tugash muddati
  status: 'pending' | 'in_progress' | 'completed' | 'paid';
  completedAt?: Date;
  paidAt?: Date;
  tasks?: string[]; // Bu bosqichdagi vazifalar ro'yxati
}

// Jamoa a'zosi interfeysi
export interface ITeamMember {
  developerId: mongoose.Types.ObjectId;
  role: 'developer' | 'team_lead';
  joinedAt: Date;
}

export interface OrderDocument extends Omit<IOrder, '_id'>, Document {
  milestones?: IMilestone[];
  totalPaid?: number;
  team?: ITeamMember[];
  teamLeadId?: mongoose.Types.ObjectId;
}

const ORDER_STATUSES: OrderStatus[] = ['in_progress', 'completed'];

const milestoneSchema = new Schema<IMilestone>(
  {
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true, min: 0 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    dueDate: { type: Date },
    status: { 
      type: String, 
      enum: ['pending', 'in_progress', 'completed', 'paid'], 
      default: 'pending' 
    },
    completedAt: { type: Date },
    paidAt: { type: Date },
    tasks: [{ type: String }],
  },
  { _id: true }
);

const teamMemberSchema = new Schema<ITeamMember>(
  {
    developerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['developer', 'team_lead'], default: 'developer' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: 'Status must be one of: ' + ORDER_STATUSES.join(', '),
      },
      default: 'in_progress',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    milestones: [milestoneSchema],
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    team: [teamMemberSchema],
    teamLeadId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ clientId: 1, createdAt: -1 });

export const Order = mongoose.model<OrderDocument>('Order', orderSchema);
