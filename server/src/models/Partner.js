import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    type: { type: String, enum: ['hotel', 'farmers', 'ngo', 'government', 'business', 'other'], default: 'other' },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    website: { type: String, trim: true, default: '' },
    logo: { type: String, default: '' },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Partner', schema);
