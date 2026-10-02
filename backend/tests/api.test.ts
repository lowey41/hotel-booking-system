import request from 'supertest';
import app from '../src/index';
import { prisma } from '../src/lib/prisma';

describe('Auth API', () => {
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass123!',
    name: 'Test User',
  };
  let accessToken: string;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await prisma.$disconnect();
  });

  it('POST /api/auth/register - should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('POST /api/auth/register - should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login - should login successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
  });

  it('POST /api/auth/login - should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'WrongPass123!' });
    expect(res.status).toBe(401);
  });

  it('GET /api/users/profile - should return profile with valid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(testUser.email);
  });
});

describe('Hotel API', () => {
  it('GET /api/hotels - should return hotels list', async () => {
    const res = await request(app).get('/api/hotels');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.hotels)).toBe(true);
  });

  it('GET /api/hotels - should support search query', async () => {
    const res = await request(app).get('/api/hotels?search=New York');
    expect(res.status).toBe(200);
  });

  it('GET /api/hotels/:id - should return 404 for invalid id', async () => {
    const res = await request(app).get('/api/hotels/nonexistent-id');
    expect(res.status).toBe(404);
  });
});

describe('Health Check', () => {
  it('GET /health - should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
