import request from 'supertest';
import { Application } from 'express';
import { DataSource } from 'typeorm';
import { createTestApp } from './testApp';

describe('Auth API (integration)', () => {
  let app: Application;
  let dataSource: DataSource;

  beforeEach(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user and returns 201 with a token', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Alice Njoroge',
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toEqual(expect.any(String));
      expect(res.body.user.email).toBe('alice@taskflow.dev');
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('returns 400 for an invalid payload (validation error handling)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'A',
        email: 'not-an-email',
        password: '123',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.length).toBeGreaterThan(0);
    });

    it('returns 409 when registering a duplicate email', async () => {
      const payload = { name: 'Alice', email: 'dup@taskflow.dev', password: 'Password123!' };
      await request(app).post('/api/auth/register').send(payload);
      const res = await request(app).post('/api/auth/register').send(payload);

      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Alice Njoroge',
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@taskflow.dev', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.token).toEqual(expect.any(String));
    });

    it('returns 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@taskflow.dev', password: 'WrongPassword1' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 without an Authorization header', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('returns the authenticated user profile with a valid token', async () => {
      const registerRes = await request(app).post('/api/auth/register').send({
        name: 'Alice Njoroge',
        email: 'alice@taskflow.dev',
        password: 'Password123!',
      });
      const token = registerRes.body.token;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('alice@taskflow.dev');
    });

    it('returns 401 for a malformed token', async () => {
      const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer garbage.token');
      expect(res.status).toBe(401);
    });
  });
});
