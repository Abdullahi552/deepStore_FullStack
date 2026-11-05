import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User, Category } from '../src/models/index.js';
import { signAccessToken } from '../src/utils/jwt.js';

// Unique per test run so we never collide with dev data or other runs
const RUN_ID = `test-${Date.now()}`;
const TEST_EMAIL = `${RUN_ID}-admin@test.local`;
const CATEGORY_PREFIX = `${RUN_ID}-`;

let adminToken;
let adminId;

const authHeader = () => ({ Authorization: `Bearer ${adminToken}` });

beforeAll(async () => {
  await connectDB();

  const passwordHash = await bcrypt.hash('testpass123', 10);
  const admin = await User.create({
    name: 'Test Admin',
    email: TEST_EMAIL,
    passwordHash,
    role: 'admin',
  });

  adminId = admin._id.toString();
  adminToken = signAccessToken({ sub: adminId, role: 'admin' });
});

afterAll(async () => {
  // Clean up only what this run created
  await Category.deleteMany({ name: { $regex: `^${CATEGORY_PREFIX}` } });
  await User.deleteOne({ _id: adminId });
  await disconnectDB();
});

// ---------------------------------------------------------------
// POST /categories
// ---------------------------------------------------------------

describe('POST /api/v1/categories', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: `${CATEGORY_PREFIX}Unauth` });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects invalid body with 422', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('creates a category and auto-generates a slug', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(authHeader())
      .send({
        name: `${CATEGORY_PREFIX}Electronics`,
        description: 'Phones and gadgets',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(`${CATEGORY_PREFIX}Electronics`);
    expect(res.body.data.slug).toBe(`${CATEGORY_PREFIX}electronics`.toLowerCase());
    expect(res.body.data.isActive).toBe(true);
  });

  it('returns 409 on duplicate slug', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .set(authHeader())
      .send({ name: `${CATEGORY_PREFIX}Electronics` });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CATEGORY_SLUG_EXISTS');
  });
});

// ---------------------------------------------------------------
// GET /categories
// ---------------------------------------------------------------

describe('GET /api/v1/categories', () => {
  it('returns a paginated envelope', async () => {
    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toMatchObject({
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      totalPages: expect.any(Number),
    });
  });

  it('supports pagination via query params', async () => {
    const res = await request(app).get('/api/v1/categories?page=1&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(5);
  });

  it('rejects invalid query params with 422', async () => {
    const res = await request(app).get('/api/v1/categories?page=not-a-number');

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ---------------------------------------------------------------
// GET /categories/:categoryId
// ---------------------------------------------------------------

describe('GET /api/v1/categories/:categoryId', () => {
  it('returns 422 for malformed id', async () => {
    const res = await request(app).get('/api/v1/categories/not-a-real-id');

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for unknown valid id', async () => {
    const res = await request(app).get(
      '/api/v1/categories/000000000000000000000000'
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });
});

// ---------------------------------------------------------------
// GET /categories/:slug/products
// ---------------------------------------------------------------

describe('GET /api/v1/categories/:slug/products', () => {
  it('returns empty products list for a new category', async () => {
    const slug = `${CATEGORY_PREFIX}electronics`.toLowerCase();
    const res = await request(app).get(`/api/v1/categories/${slug}/products`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(0);
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get(
      '/api/v1/categories/does-not-exist-slug/products'
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });
});

// ---------------------------------------------------------------
// PATCH /categories/:categoryId
// ---------------------------------------------------------------

describe('PATCH /api/v1/categories/:categoryId', () => {
  it('updates a category without changing the slug', async () => {
    const created = await request(app)
      .post('/api/v1/categories')
      .set(authHeader())
      .send({ name: `${CATEGORY_PREFIX}Phones` });

    const { _id, slug } = created.body.data;

    const res = await request(app)
      .patch(`/api/v1/categories/${_id}`)
      .set(authHeader())
      .send({ description: 'Updated description' });

    expect(res.status).toBe(200);
    expect(res.body.data.description).toBe('Updated description');
    expect(res.body.data.slug).toBe(slug); // unchanged
  });

  it('rejects empty update body with 422', async () => {
    const created = await request(app)
      .post('/api/v1/categories')
      .set(authHeader())
      .send({ name: `${CATEGORY_PREFIX}EmptyPatch` });

    const res = await request(app)
      .patch(`/api/v1/categories/${created.body.data._id}`)
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('regenerates slug when name changes', async () => {
    const created = await request(app)
      .post('/api/v1/categories')
      .set(authHeader())
      .send({ name: `${CATEGORY_PREFIX}OldName` });

    const res = await request(app)
      .patch(`/api/v1/categories/${created.body.data._id}`)
      .set(authHeader())
      .send({ name: `${CATEGORY_PREFIX}NewName` });

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(`${CATEGORY_PREFIX}newname`.toLowerCase());
  });
});

// ---------------------------------------------------------------
// DELETE /categories/:categoryId (soft delete)
// ---------------------------------------------------------------

describe('DELETE /api/v1/categories/:categoryId', () => {
  it('soft-deletes and hides from public list', async () => {
    const created = await request(app)
      .post('/api/v1/categories')
      .set(authHeader())
      .send({ name: `${CATEGORY_PREFIX}Doomed` });

    const { _id } = created.body.data;

    const del = await request(app)
      .delete(`/api/v1/categories/${_id}`)
      .set(authHeader());

    expect(del.status).toBe(200);
    expect(del.body.data.isActive).toBe(false);

    const get = await request(app).get(`/api/v1/categories/${_id}`);
    expect(get.status).toBe(404);
  });
});