import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 140, default: '' },
    caption: { type: String, trim: true, maxlength: 300, default: '' },
    category: { type: String, enum: ['waste', 'process', 'product', 'farmers', 'team'], default: 'process' },
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Gallery', schema);
