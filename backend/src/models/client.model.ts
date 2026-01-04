import mongoose, { Schema, Document } from 'mongoose';
import { IClient, ClientStatus } from '../types';

export interface ClientDocument extends Omit<IClient, '_id'>, Document {}

const CLIENT_STATUSES: ClientStatus[] = ['new', 'thinking', 'agreed', 'rejected', 'callback'];

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
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    location: {
      address: {
        type: String,
        trim: true,
        maxlength: [200, 'Address cannot exceed 200 characters'],
      },
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
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
      default: 'new',
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
// Geospatial index for map queries
clientSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

export const Client = mongoose.model<ClientDocument>('Client', clientSchema);
