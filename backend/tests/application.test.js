const request = require('supertest');
const app = require('../index');

describe('Application CRUD', () => {
  let token;
  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'john@example.com', password: 'password123' });
    token = res.body.token;
  });

  it('should create, update and delete an application', async () => {
    const create = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ companyName: 'TestCo', jobTitle: 'Test Role', salary: 50000 });
    expect(create.statusCode).toBe(201);
    const id = create.body.application.id;

    const update = await request(app)
      .put(`/api/applications/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ jobTitle: 'Test Role Updated' });
    expect(update.statusCode).toBe(200);

    const del = await request(app)
      .delete(`/api/applications/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(del.statusCode).toBe(200);
  });
});
