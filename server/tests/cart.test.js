const request = require('supertest');
const app = require('../app');
const pool = require('../db');

describe('Cart routes', () => {
  let userToken;
  const unique = Date.now();

  beforeAll(async () => {
    // Register and login a user
    const user = {
      first_name: 'Cart',
      last_name: 'Test',
      email: `carttest${unique}@example.com`,
      identity_number: `${unique}`, // Usando o timestamp como número de identidade único
      password: 'cartpass',
      city: 'City',
      street: 'Street 3',
      role: 'client'
    };
    const reg = await request(app).post('/api/auth/register').send(user);
    expect(reg.statusCode).toBe(201);
    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    userToken = login.body.token;
  });

  it('POST /api/cart should create a new cart', async () => {
    const res = await request(app).post('/api/cart').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('cart_id');
  });

  it('POST /api/cart/items should add item to cart', async () => {
    const item = { product_id: 1, quantity: 2, price: 3.5 };
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send(item);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Item added');
  });
});

afterAll(() => pool.end());
