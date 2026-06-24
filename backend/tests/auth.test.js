const request = require('supertest');
const app = require('../index'); // index.js should export the express app for testing

describe('Auth Endpoints', () => {
  it('should return 200 for login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password123' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
