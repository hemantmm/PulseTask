import bcrypt from 'bcryptjs';
import { connectDb } from './src/config/db.js';
import { User } from './src/models/User.js';

async function seed() {
  try {
    await connectDb();

    const testUsers = [
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

    await User.deleteMany({ tenantId: 'test-org' });

    for (const userData of testUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      await User.create({
        tenantId: userData.tenantId,
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role
      });
    }

    console.log('\n✓ Seeded test users for tenant: test-org\n');
    console.log('=== Login Credentials ===\n');
    testUsers.forEach((user) => {
      console.log(`Role: ${user.role.toUpperCase()}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Tenant: ${user.tenantId}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
