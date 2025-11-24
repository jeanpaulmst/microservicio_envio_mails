import mongoose from 'mongoose';

const microserviceAuthSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  microserviceOwner: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: false
});

export const MicroserviceAuthModel = mongoose.model('MicroserviceAuth', microserviceAuthSchema);
