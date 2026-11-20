import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 160 },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    subject: { type: String, trim: true, maxlength: 160, default: '' },
    body: { type: String, required: true, maxlength: 4000 },
    interest: { type: String, enum: ['general', 'hotel-partner', 'farmer', 'buy', 'media', 'volunteer'], default: 'general' },
    read: { type: Boolean, default: false },
    replied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Message', schema);
