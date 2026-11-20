import User from '../models/User.js';
import { PERMISSIONS } from '../config/permissions.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const cleanPerms = (p) => (Array.isArray(p) ? [...new Set(p.filter((x) => PERMISSIONS.includes(x)))] : []);

export const listAdmins = asyncHandler(async (_req, res) => {
  res.json(await User.find().sort({ role: -1, createdAt: 1 }));
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, permissions, active } = req.body;
  if (!password || String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  }
  const user = await User.create({
    name, email, password, role: 'admin', permissions: cleanPerms(permissions), active: active !== false,
  });
  res.status(201).json(user);
});

export const updateAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (user.role === 'superadmin') return res.status(400).json({ message: 'The super admin account cannot be changed here.' });

  const { name, email, permissions, active, password } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (permissions !== undefined) user.permissions = cleanPerms(permissions);
  if (active !== undefined) user.active = !!active;
  if (password) {
    if (String(password).length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    user.password = password;
  }
  await user.save();
  res.json(user);
});

export const removeAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Not found' });
  if (user.role === 'superadmin') return res.status(400).json({ message: 'The super admin cannot be deleted.' });
  await user.deleteOne();
  res.json({ message: 'Deleted' });
});
