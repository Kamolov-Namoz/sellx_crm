import mongoose, { Schema, Document } from 'mongoose';
import { Types } from 'mongoose';
import { ConversationType } from '../types';

export interface IConversation {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  userId: Types.ObjectId;
  type: ConversationType;
  content: string; // Text content or file URL
  summary: string; // Required summary/note
  nextFollowUpDate: Date;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number; // For audio/video in seconds
    mimeType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDocument extends Omit<IConversation, '_id'>, Document {}

const conversationSchema = new Schema<ConversationDocument>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'audio', 'image', 'video'],
      required: [true, 'Conversation type is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      maxlength: [2000, 'Summary cannot exceed 2000 characters'],
    },
    nextFollowUpDate: {
      type: Date,
      required: [true, 'Next follow-up date is required'],
    },
    metadata: {
      fileName: String,
      fileSize: Number,
      duration: Number,
      mimeType: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
conversationSchema.index({ clientId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, clientId: 1 });

export const Conversation = mongoose.model<ConversationDocument>('Conversation', conversationSchema);
