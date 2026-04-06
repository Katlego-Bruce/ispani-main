const request = require('supertest');
const app = require('../app');
const { prisma } = require('../services/prisma');

// Clean up test data after all tests
afterAll(async () => {
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.user.deleteMany({
    where: { email: { contains: '@test-ci.ispani.co.za' } },
  });
  await prisma.$disconnect();
});

describe('Auth — Register', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({
        email: 'worker@test-ci.ispani.co.za',
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'Worker',
        type: 'worker',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('access_token');
    expect(res.body.data.user.email).toBe('worker@test-ci.ispani.co.za');
    expect(res.body.data.user.type).toBe('worker');
  });

  it('should reject duplicate email', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({
        email: 'worker@test-ci.ispani.co.za',
        password: 'TestPass123!',
      });

    expect(res.statusCode).toBe(409);
  });

  it('should reject missing password', async () => {
    const res = await request(app)
      .post('/users/register')
      .send({ email: 'no-pass@test-ci.ispani.co.za' });

    expect(res.statusCode).toBe(400);
  });
});

describe('Auth — Login', () => {
  it('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email: 'worker@test-ci.ispani.co.za',
        password: 'TestPass123!',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('access_token');
  });

  it('should reject wrong password', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email: 'worker@test-ci.ispani.co.za',
        password: 'WrongPassword!',
      });

    expect(res.statusCode).toBe(401);
  });

  it('should reject non-existent user', async () => {
    const res = await request(app)
      .post('/users/login')
      .send({
        email: 'nobody@test-ci.ispani.co.za',
        password: 'TestPass123!',
      });

    expect(res.statusCode).toBe(401);
  });
});

describe('Protected Routes', () => {
  it('should reject requests without token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.statusCode).toBe(401);
  });

  it('should accept requests with valid token', async () => {
    // Login first to get token
    const loginRes = await request(app)
      .post('/users/login')
      .send({
        email: 'worker@test-ci.ispani.co.za',
        password: 'TestPass123!',
      });

    const token = loginRes.body.data.access_token;

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('worker@test-ci.ispani.co.za');
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer invalid-token-here');

    expect(res.statusCode).toBe(401);
  });
});
