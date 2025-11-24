import mongoose from 'mongoose';
import { MailEventResult } from '../../../../domain/entities/mailEvent.js';

const mailEventSchema = new mongoose.Schema({
  emailEventId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  templateId: {
    type: String,
    required: true,
    index: true
  },
  to: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  templateData: {
    type: String,
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true,
    index: true
  },
  retries: {
    type: Number,
    required: true,
    default: 3
  },
  retryCount: {
    type: Number,
    required: true,
    default: 0
  },
  result: {
    type: String,
    enum: Object.values(MailEventResult),
    required: true,
    default: MailEventResult.PENDING,
    index: true
  }
}, {
  timestamps: true
});

export const MailEventModel = mongoose.model('MailEvent', mailEventSchema);
