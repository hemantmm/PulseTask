import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const demoUsers = [
  {
    tenantId: 'test-org',
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    tenantId: 'test-org',
    name: 'Editor User',
    email: 'editor@test.com',
    password: 'Editor123!',
    role: 'editor'
  },
  {
    tenantId: 'test-org',
    name: 'Viewer User',
    email: 'viewer@test.com',
    password: 'Viewer123!',
    role: 'viewer'
  }
];

export async function ensureDemoUsers() {
  for (const userData of demoUsers) {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });
    if (existing) continue;

    const passwordHash = await bcrypt.hash(userData.password, 10);
    await User.create({
      tenantId: userData.tenantId,
      name: userData.name,
      email: userData.email.toLowerCase(),
      passwordHash,
      role: userData.role
    });
  }
}
