import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

export async function seedDefaultUsers() {
  const usersToSeed = [
    {
      fullName: 'System Admin',
      email: 'admin@college.edu',
      password: 'Admin123!',
      role: 'admin',
    },
    {
      fullName: 'Dr. Karma Wangchuk',
      email: 'instructor@college.edu',
      password: 'Instructor123!',
      role: 'instructor',
      department: 'Computer Science',
    },
    {
      fullName: 'Choyang Dema',
      email: 'student@college.edu',
      password: 'Student123!',
      role: 'student',
      department: 'Computer Science',
      enrollmentId: 'STU1001',
    },
  ];

  for (const u of usersToSeed) {
    const existing = await User.findOne({ email: u.email.toLowerCase() });
    if (!existing) {
      await User.create(u);
      console.log(`Seeded ${u.role} account: ${u.email}`);
    }
  }
}

async function runSeed() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
  await seedDefaultUsers();
  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('seedAdmin.js')) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
}
