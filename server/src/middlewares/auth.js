import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please sign in.' });

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }

  const user = await User.findById(payload.id);
  if (!user || !user.active) return res.status(401).json({ message: 'This account is not active.' });
  if (user.passwordChangedAt && payload.iat * 1000 < user.passwordChangedAt.getTime()) {
    return res.status(401).json({ message: 'Password was changed. Please sign in again.' });
  }
  req.user = user;
  next();
});

export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user?.can(permission)) {
    return res.status(403).json({ message: 'You do not have access to this section.' });
  }
  next();
};

export const superAdminOnly = (req, res, next) => {
  if (req.user?.role !== 'superadmin') {
    return res.status(403).json({ message: 'Only the super admin can do this.' });
  }
  next();
};
