import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { User } from '../src/models/index.js';
import { signAccessToken } from '../src/utils/jwt.js';

// Unique per test run so we never collide with dev data or other runs
const RUN_ID = `test-auth-${Date.now()}`;
const EMAIL = `${RUN_ID}-auth@test.local`;
const OTHER_EMAIL = `${RUN_ID}-auth2@test.local`;

let seededUser;
let seededToken;

const authHeader = (token = seededToken) => ({
  Authorization: `Bearer ${token}`,
});

beforeAll(async () => {
  await connectDB();

  const passwordHash = await bcrypt.hash('password123', 10);
  seededUser = await User.create({
    name: 'Seeded User',
    email: EMAIL,
    passwordHash,
    role: 'customer',
  });
  seededToken = signAccessToken({
    sub: seededUser._id.toString(),
    role: seededUser.role,
  });
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: `^${RUN_ID}` } });
  await disconnectDB();
});

// ---------------------------------------------------------------
// POST /api/v1/auth/register
// ---------------------------------------------------------------

describe('POST /api/v1/auth/register', () => {
  it('registers a new user with 201 and hides secrets', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'New User',
      email: OTHER_EMAIL,
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(OTHER_EMAIL);
    expect(res.body.data.role).toBe('customer');
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email with 409', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Duplicate',
      email: OTHER_EMAIL,
      password: 'password123',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rejects short password with 422', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Short',
      email: `${RUN_ID}-short@test.local`,
      password: 'short',
    });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ---------------------------------------------------------------
// POST /api/v1/auth/login
// ---------------------------------------------------------------

describe('POST /api/v1/auth/login', () => {
  it('logs in with valid credentials and returns tokens', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: EMAIL,
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects wrong password with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: EMAIL,
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects unknown email with 401', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: `${RUN_ID}-ghost@test.local`,
      password: 'password123',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

// ---------------------------------------------------------------
// POST /api/v1/auth/refresh
// ---------------------------------------------------------------

describe('POST /api/v1/auth/refresh', () => {
  it('issues a new access token for a valid refresh token', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({
      email: EMAIL,
      password: 'password123',
    });

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: login.body.data.refreshToken });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects a garbage token with 401 TOKEN_INVALID', async () => {
    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'not.a.token' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_INVALID');
  });

  it('rejects an expired token with 401 TOKEN_EXPIRED', async () => {
    const expired = jwt.sign(
      { sub: seededUser._id.toString(), role: 'customer' },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '-10s' }
    );

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: expired });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });
});

// ---------------------------------------------------------------
// POST /api/v1/auth/logout
// ---------------------------------------------------------------

describe('POST /api/v1/auth/logout', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/auth/logout');

    expect(res.status).toBe(401);
  });

  it('returns 204 and revokes the refresh token', async () => {
    const login = await request(app).post('/api/v1/auth/login').send({
      email: OTHER_EMAIL,
      password: 'password123',
    });
    const { accessToken, refreshToken } = login.body.data;

    const logout = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logout.status).toBe(204);

    const refresh = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken });

    expect(refresh.status).toBe(401);
    expect(refresh.body.error.code).toBe('TOKEN_INVALID');
  });
});

// ---------------------------------------------------------------
// GET /api/v1/auth/me
// ---------------------------------------------------------------

describe('GET /api/v1/auth/me', () => {
  it('returns the current user', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(EMAIL);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');

    expect(res.status).toBe(401);
  });
});