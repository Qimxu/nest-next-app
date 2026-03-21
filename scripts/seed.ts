/**
 * Database Seed Script
 *
 * Creates the initial admin user if it doesn't already exist.
 *
 * Usage:
 *   npm run seed
 *
 * Environment variables (or defaults):
 *   SEED_ADMIN_EMAIL    - admin@example.com
 *   SEED_ADMIN_PASSWORD - Admin@123456
 *   SEED_ADMIN_NAME     - Admin
 */

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'nest_next_app',
  synchronize: false,
  entities: [join(__dirname, '../src/**/*.entity{.ts,.js}')],
});

async function seed() {
  await dataSource.initialize();
  console.log('✅ Database connected');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.SEED_ADMIN_NAME || 'Admin';

  const userRepo = dataSource.getRepository('users');

  const existing = await userRepo.findOne({ where: { email: adminEmail } });
  if (existing) {
    console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await userRepo.save({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  console.log(`🌱 Admin user created: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(
    '   ⚠️  Please change this password immediately after first login!',
  );

  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
