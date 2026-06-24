const request = require('supertest');
const app = require('../index');

describe('Analytics', () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'john@example.com', password: 'password123' });
    token = res.body.token;
  });

  it('should return stats JSON', async () => {
    const res = await request(app)
      .get('/api/applications/stats')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('stats');
  });
});
