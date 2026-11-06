import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/index.js';
import { signAccessToken } from '../src/utils/jwt.js';

const RUN_ID = `test-user-${Date.now()}`;
const EMAIL = `${RUN_ID}-user@test.local`;
const TAKEN_EMAIL = `${RUN_ID}-taken@test.local`;

let user;
let token;

const authHeader = () => ({ Authorization: `Bearer ${token}` });

beforeAll(async () => {
  await connectDB();

  const passwordHash = await bcrypt.hash('password123', 10);
  user = await User.create({
    name: 'Profile User',
    email: EMAIL,
    passwordHash,
    role: 'customer',
  });
  await User.create({
    name: 'Other User',
    email: TAKEN_EMAIL,
    passwordHash,
    role: 'customer',
  });

  token = signAccessToken({ sub: user._id.toString(), role: user.role });
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: `^${RUN_ID}` } });
  await disconnectDB();
});

// ---------------------------------------------------------------
// GET /api/v1/users/me
// ---------------------------------------------------------------

describe('GET /api/v1/users/me', () => {
  it('returns the profile for the authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(EMAIL);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/users/me');

    expect(res.status).toBe(401);
  });
});

// ---------------------------------------------------------------
// PATCH /api/v1/users/me
// ---------------------------------------------------------------

describe('PATCH /api/v1/users/me', () => {
  it('updates the name', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set(authHeader())
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('rejects an email that is already taken with 409', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set(authHeader())
      .send({ email: TAKEN_EMAIL });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rejects an empty body with 422', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ---------------------------------------------------------------
// PATCH /api/v1/users/me/password
// ---------------------------------------------------------------

describe('PATCH /api/v1/users/me/password', () => {
  it('rejects a wrong current password with 401', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/password')
      .set(authHeader())
      .send({ currentPassword: 'not-the-password', newPassword: 'newpassword123' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('changes the password and the new one works for login', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/password')
      .set(authHeader())
      .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

    expect(res.status).toBe(200);

    const login = await request(app).post('/api/v1/auth/login').send({
      email: EMAIL,
      password: 'newpassword123',
    });

    expect(login.status).toBe(200);
  });

  it('rejects a short new password with 422', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me/password')
      .set(authHeader())
      .send({ currentPassword: 'newpassword123', newPassword: 'short' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});