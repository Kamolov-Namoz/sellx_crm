import mongoose, { Schema, Document } from 'mongoose';
import { IClient, ClientStatus } from '../types';

export interface ClientDocument extends Omit<IClient, '_id'>, Document {}

const CLIENT_STATUSES: ClientStatus[] = ['interested', 'thinking', 'callback', 'not_interested', 'deal_closed'];

const clientSchema = new Schema<ClientDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    brandName: {
      type: String,
      trim: true,
      maxlength: [100, 'Brand name cannot exceed 100 characters'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: CLIENT_STATUSES,
        message: 'Status must be one of: ' + CLIENT_STATUSES.join(', '),
      },
      default: 'interested',
    },
    followUpDate: {
      type: Date,
    },
    lastConversationSummary: {
      type: String,
      trim: true,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query optimization
clientSchema.index({ userId: 1, status: 1 });
clientSchema.index({ userId: 1, followUpDate: 1 });
clientSchema.index({ userId: 1, createdAt: -1 });

export const Client = mongoose.model<ClientDocument>('Client', clientSchema);
