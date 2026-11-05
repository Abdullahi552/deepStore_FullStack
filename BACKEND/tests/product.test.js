import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User, Category, Product } from '../src/models/index.js';
import { signAccessToken } from '../src/utils/jwt.js';

const RUN_ID = `test-${Date.now()}`;
const TEST_EMAIL = `${RUN_ID}-admin@test.local`;
const PREFIX = `${RUN_ID}-`;

let adminToken;
let adminId;
let categoryId;

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

  const category = await Category.create({
    name: `${PREFIX}Cat`,
    slug: `${PREFIX}cat`.toLowerCase(),
  });
  categoryId = category._id.toString();
});

afterAll(async () => {
  await Product.deleteMany({ name: { $regex: `^${PREFIX}` } });
  await Category.deleteMany({ name: { $regex: `^${PREFIX}` } });
  await User.deleteOne({ _id: adminId });
  await disconnectDB();
});

// ---------------------------------------------------------------
// POST /products
// ---------------------------------------------------------------

describe('POST /api/v1/products', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .send({ name: `${PREFIX}Unauth`, price: 1000, category: categoryId });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('creates a product with auto-generated slug', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({
        name: `${PREFIX}Headphones`,
        description: 'Noise cancelling',
        price: 4500000,
        category: categoryId,
        stock: 25,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.slug).toBe(`${PREFIX}headphones`.toLowerCase());
    expect(res.body.data.price).toBe(4500000);
    expect(res.body.data.category._id).toBe(categoryId);
  });

  it('rejects decimal price with 422', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({
        name: `${PREFIX}Decimal`,
        price: 100.5,
        category: categoryId,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.some((d) => d.field === 'price')).toBe(true);
  });

  it('rejects negative price with 422', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({
        name: `${PREFIX}Negative`,
        price: -100,
        category: categoryId,
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing category with 422', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({ name: `${PREFIX}NoCat`, price: 1000 });

    expect(res.status).toBe(422);
    expect(res.body.error.details.some((d) => d.field === 'category')).toBe(true);
  });

  it('rejects non-existent category with 400', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({
        name: `${PREFIX}BadCat`,
        price: 1000,
        category: '000000000000000000000000',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CATEGORY_NOT_FOUND');
  });

  it('returns 409 on duplicate slug', async () => {
    await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({ name: `${PREFIX}Dup`, price: 1000, category: categoryId });

    const res = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({ name: `${PREFIX}Dup`, price: 2000, category: categoryId });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('PRODUCT_SLUG_EXISTS');
  });
});

// ---------------------------------------------------------------
// GET /products
// ---------------------------------------------------------------

describe('GET /api/v1/products', () => {
  beforeAll(async () => {
    await Product.create({
      name: `${PREFIX}Searchable Widget`,
      slug: `${PREFIX}searchable-widget`.toLowerCase(),
      price: 3000000,
      category: categoryId,
      stock: 5,
    });
  });

  it('returns a paginated envelope', async () => {
    const res = await request(app).get('/api/v1/products');

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

  it('search matches name', async () => {
    const res = await request(app).get(
      `/api/v1/products?search=${PREFIX}Searchable`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toContain('Searchable');
  });

  it('search with no match returns empty', async () => {
    const res = await request(app).get('/api/v1/products?search=zzzznotfound');

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('filters by category', async () => {
    const res = await request(app).get(
      `/api/v1/products?category=${categoryId}`
    );

    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.category._id === categoryId)).toBe(true);
  });

  it('filters by price range', async () => {
    const res = await request(app).get(
      '/api/v1/products?minPrice=2500000&maxPrice=3500000'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.every((p) => p.price >= 2500000 && p.price <= 3500000)).toBe(true);
  });

  it('rejects inverted price range with 400', async () => {
    const res = await request(app).get(
      '/api/v1/products?minPrice=5000000&maxPrice=100'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.message).toMatch(/minPrice cannot exceed maxPrice/);
  });

  it('rejects invalid category id in query with 422', async () => {
    const res = await request(app).get('/api/v1/products?category=not-an-id');

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ---------------------------------------------------------------
// GET /products/:productId
// ---------------------------------------------------------------

describe('GET /api/v1/products/:productId', () => {
  it('returns 422 for malformed id', async () => {
    const res = await request(app).get('/api/v1/products/not-a-real-id');

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 for unknown valid id', async () => {
    const res = await request(app).get(
      '/api/v1/products/000000000000000000000000'
    );

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });
});

// ---------------------------------------------------------------
// PATCH /products/:productId
// ---------------------------------------------------------------

describe('PATCH /api/v1/products/:productId', () => {
  it('updates price without changing slug', async () => {
    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({ name: `${PREFIX}PatchMe`, price: 1000, category: categoryId });

    const { _id, slug } = created.body.data;

    const res = await request(app)
      .patch(`/api/v1/products/${_id}`)
      .set(authHeader())
      .send({ price: 2000 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(2000);
    expect(res.body.data.slug).toBe(slug);
  });

  it('regenerates slug when name changes', async () => {
    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({ name: `${PREFIX}OldName`, price: 1000, category: categoryId });

    const res = await request(app)
      .patch(`/api/v1/products/${created.body.data._id}`)
      .set(authHeader())
      .send({ name: `${PREFIX}NewName` });

    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe(`${PREFIX}newname`.toLowerCase());
  });

  it('rejects empty update body with 422', async () => {
    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({ name: `${PREFIX}EmptyPatch`, price: 1000, category: categoryId });

    const res = await request(app)
      .patch(`/api/v1/products/${created.body.data._id}`)
      .set(authHeader())
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ---------------------------------------------------------------
// DELETE /products/:productId
// ---------------------------------------------------------------

describe('DELETE /api/v1/products/:productId', () => {
  it('soft-deletes and hides from public list', async () => {
    const created = await request(app)
      .post('/api/v1/products')
      .set(authHeader())
      .send({ name: `${PREFIX}Doomed`, price: 1000, category: categoryId });

    const { _id } = created.body.data;

    const del = await request(app)
      .delete(`/api/v1/products/${_id}`)
      .set(authHeader());

    expect(del.status).toBe(200);
    expect(del.body.data.isActive).toBe(false);

    const get = await request(app).get(`/api/v1/products/${_id}`);
    expect(get.status).toBe(404);
  });
});