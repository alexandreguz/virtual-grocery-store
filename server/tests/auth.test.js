const request = require('supertest');
const app = require('../app');
const pool = require('../db');

describe('Auth routes', () => {
  const unique = Date.now();
  const validUser = {
    first_name: 'Test',
    last_name: 'User',
    email: `testuser${unique}@example.com`,
    identity_number: `${unique}`,
    password: 'password123',
    city: 'City',
    street: 'Street 1',
    role: 'client'
  };

  it('POST /api/auth/register with valid payload should return 201 and token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /api/auth/login with correct credentials should return 200 and token', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email, password: validUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});

afterAll(() => pool.end());