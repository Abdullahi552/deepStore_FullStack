import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Smoke tests', () => {
  it('GET /api/v1/health returns 200 with success envelope', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.version).toBe('1.0.0');
    expect(res.body.data.timestamp).toBeDefined();
  });

  it('GET /api/v1/nonexistent returns 404 with error envelope', async () => {
    const res = await request(app).get('/api/v1/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.message).toContain('Route not found');
  });
});