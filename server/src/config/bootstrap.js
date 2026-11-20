import User from '../models/User.js';
import { env } from './env.js';

// Creates the super admin from .env the first time the server starts.
export async function ensureSuperAdmin() {
  const existing = await User.findOne({ role: 'superadmin' });
  if (existing) return existing;

  const configuredUser = await User.findOne({ email: env.superAdmin.email });
  if (configuredUser) {
    configuredUser.role = 'superadmin';
    await configuredUser.save();
    console.log(`Super admin account promoted: ${configuredUser.email}`);
    return configuredUser;
  }

  const user = await User.create({
    name: env.superAdmin.name,
    email: env.superAdmin.email,
    password: env.superAdmin.password,
    role: 'superadmin',
    permissions: [],
  });
  console.log(`Super admin created: ${user.email}`);
  return user;
}
