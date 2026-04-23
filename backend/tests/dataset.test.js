const request = require('supertest');
const app = require('../server');

describe('Dataset API', () => {
  let token;

  beforeAll(async () => {
    // Register and login to get token
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    token = loginRes.body.token;
  });

  it('should list datasets', async () => {
    const response = await request(app)
      .get('/api/datasets')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});