// One-time setup script: creates the first Admin account directly in the
// database. This is the only way an Admin account exists initially — after
// this, that Admin can create instructors and secondary admins through
// POST /api/auth/create-staff.
//
// Usage:
//   node utils/seedAdmin.js
// (reads MONGO_URI from .env, same as the server does)

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'System Admin';
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@college.edu';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set. Copy .env.example to .env and fill it in first.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to ${mongoose.connection.name}`);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`An account with email ${ADMIN_EMAIL} already exists (role: ${existing.role}). Nothing to do.`);
  } else {
    const admin = await User.create({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log('First admin account created:');
    console.log(`  email:    ${admin.email}`);
    console.log(`  password: ${ADMIN_PASSWORD}  (change this after first login)`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
