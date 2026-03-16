import mongoose from 'mongoose';

const microserviceAuthSchema = new mongoose.Schema({
  microserviceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: false
});

export const MicroserviceAuthModel = mongoose.model('MicroserviceAuth', microserviceAuthSchema);
