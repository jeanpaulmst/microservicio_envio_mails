import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  templateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  subject: {
    type: String,
    required: true
  },
  htmlBody: {
    type: String,
    required: true
  },
  textBody: {
    type: String,
    default: null
  },
  microserviceOwner: {
    type: String,
    required: true,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export const TemplateModel = mongoose.model('Template', templateSchema);
