import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true },
    category: { type: String, enum: ['news', 'funding', 'production', 'event', 'notice'], default: 'news' },
    image: { type: String, default: '' },
    pinned: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', schema);
