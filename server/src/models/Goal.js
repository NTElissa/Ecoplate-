import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['objective', 'milestone', 'step'], default: 'objective' },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 600, default: '' },
    phase: { type: String, trim: true, maxlength: 60, default: '' },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Goal', schema);
