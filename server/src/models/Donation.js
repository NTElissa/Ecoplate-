import mongoose from 'mongoose';
import crypto from 'crypto';

const schema = new mongoose.Schema(
  {
    reference: { type: String, unique: true, index: true },
    donorName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: '' },
    phone: { type: String, trim: true, maxlength: 40, default: '' },
    amount: { type: Number, required: true, min: 500 },
    currency: { type: String, default: 'RWF' },
    method: { type: String, enum: ['momo', 'bank', 'cash', 'other'], default: 'momo' },
    message: { type: String, trim: true, maxlength: 600, default: '' },
    anonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
    confirmedAt: Date,
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, default: '' },
    // Everything the team has said back to this donor.
    replies: [
      {
        channel: { type: String, enum: ['email', 'email-app', 'whatsapp', 'sms', 'note'], default: 'note' },
        subject: { type: String, default: '' },
        message: { type: String, required: true, maxlength: 4000 },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        byName: { type: String, default: '' },
        at: { type: Date, default: Date.now },
      },
    ],
    lastRepliedAt: Date,
  },
  { timestamps: true }
);

schema.pre('validate', function (next) {
  if (!this.reference) this.reference = 'EP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  next();
});

export default mongoose.model('Donation', schema);
