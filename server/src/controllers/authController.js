import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sign = (user) => jwt.sign({ id: user._id }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

// The sign-in URL contains a secret segment from .env. A wrong segment looks like any other missing page.
export const login = asyncHandler(async (req, res) => {
  if (req.params.slug !== env.adminLoginPath) return res.status(404).json({ message: 'Not found' });

  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ message: 'Enter your email and password.' });

  const user = await User.findOne({ email }).select('+password');
  const ok = user && (await user.matchPassword(password));
  if (!ok) return res.status(401).json({ message: 'Email or password is not correct.' });
  if (!user.active) return res.status(403).json({ message: 'This account has been switched off. Contact the super admin.' });

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  res.json({ token: sign(user), user });
});

export const me = (req, res) => res.json({ user: req.user });

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters.' });
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    return res.status(400).json({ message: 'Current password is not correct.' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ token: sign(user), message: 'Password updated.' });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) return res.status(400).json({ message: 'Name is required.' });
  req.user.name = name;
  await req.user.save({ validateBeforeSave: false });
  res.json({ user: req.user });
});
