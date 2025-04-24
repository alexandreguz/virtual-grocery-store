const request = require('supertest');
const app = require('../app');

describe('Basic API tests', () => {
  it('GET /api/auth/user without token should return 403', async () => {
    const res = await request(app).get('/api/auth/user');
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Token not provided');
  });
});
