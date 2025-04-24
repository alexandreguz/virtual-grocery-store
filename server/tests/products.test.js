const request = require('supertest');
const app = require('../app');
const pool = require('../db');

describe('Product routes', () => {
  let adminToken;
  const unique = Date.now();

  beforeAll(async () => {
    // Register and login an admin user
    const admin = {
      first_name: 'Admin',
      last_name: 'Test',
      email: `admintest${unique}@example.com`,
      identity_number: `${unique}`, // Usando o timestamp como número de identidade único
      password: 'adminpass',
      city: 'City',
      street: 'Street 2',
      role: 'admin'
    };
    const reg = await request(app).post('/api/auth/register').send(admin);
    expect(reg.statusCode).toBe(201);
    const login = await request(app).post('/api/auth/login').send({ email: admin.email, password: admin.password });
    adminToken = login.body.token;
  });

  it('GET /api/products should return 200 and array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/products should create product with admin token', async () => {
    const newProduct = { name: 'TestProd', price: 9.99, image: 'img.png', category: 'Fruits', quantity: 5 };
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newProduct);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('product');
  });
});

afterAll(() => pool.end());
