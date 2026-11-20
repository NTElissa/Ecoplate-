import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    summary: { type: String, trim: true, maxlength: 400, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['planned', 'ongoing', 'completed'], default: 'ongoing' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Project', schema);
