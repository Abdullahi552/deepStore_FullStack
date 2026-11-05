// Dev-only helper: creates an admin and a customer in the DB and prints JWTs.
// Usage: node scripts/create-test-users.js
//
// Safe to run repeatedly — it will reuse existing users.

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';
import { User } from '../src/models/index.js';
import { signAccessToken } from '../src/utils/jwt.js';

const TEST_USERS = [
  {
    name: 'DeepStore Admin',
    email: 'admin@deepstore.dev',
    password: 'admin1234',
    role: 'admin',
  },
  {
    name: 'Test Customer',
    email: 'customer@deepstore.dev',
    password: 'customer1234',
    role: 'customer',
  },
];

const ensureUser = async ({ name, email, password, role }) => {
  let user = await User.findOne({ email });

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await User.create({ name, email, passwordHash, role });
    console.log(`✅ Created ${role}: ${email}`);
  } else {
    console.log(`ℹ️  ${role} already exists: ${email}`);
  }

  const token = signAccessToken({ sub: user._id.toString(), role: user.role });
  return { user, token };
};

const run = async () => {
  await mongoose.connect(env.MONGODB_URI);

  console.log('\n--- Test users ---\n');

  for (const spec of TEST_USERS) {
    const { user, token } = await ensureUser(spec);
    console.log(`  ${spec.role.padEnd(8)} | ${spec.email}  | password: ${spec.password}`);
    console.log(`  token: ${token}\n`);
  }

  await mongoose.disconnect();
  console.log('Done.\n');
};

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});