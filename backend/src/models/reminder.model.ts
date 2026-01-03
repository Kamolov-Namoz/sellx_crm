import mongoose, { Schema, Document } from 'mongoose';
import { IScheduledReminder } from '../types';

export interface ReminderDocument extends Omit<IScheduledReminder, '_id'>, Document {}

const REMINDER_STATUSES = ['pending', 'sent', 'cancelled'] as const;

const reminderSchema = new Schema<ReminderDocument>(
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
    scheduledTime: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    status: {
      type: String,
      enum: {
        values: REMINDER_STATUSES,
        message: 'Status must be one of: ' + REMINDER_STATUSES.join(', '),
      },
      default: 'pending',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Index for scheduler queries - find pending reminders due now
reminderSchema.index({ scheduledTime: 1, status: 1 });

// Index for finding reminders by client (for cascade delete)
reminderSchema.index({ clientId: 1 });

export const ScheduledReminder = mongoose.model<ReminderDocument>('ScheduledReminder', reminderSchema);
