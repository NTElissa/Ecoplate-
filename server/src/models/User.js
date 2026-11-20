import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { PERMISSIONS } from '../config/permissions.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
    permissions: [{ type: String, enum: PERMISSIONS }],
    active: { type: Boolean, default: true },
    lastLogin: Date,
    passwordChangedAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(String(plain || ''), this.password);
};

userSchema.methods.can = function (permission) {
  return this.active && (this.role === 'superadmin' || this.permissions.includes(permission));
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);
