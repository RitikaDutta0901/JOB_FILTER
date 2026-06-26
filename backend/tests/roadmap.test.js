const request = require('supertest');
const app = require('../index');

describe('Interview Roadmap', () => {
  let token;
  let applicationId;

  beforeAll(async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password123' });
    token = login.body.token;

    const create = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({
        companyName: 'Roadmap Test Labs',
        jobTitle: 'Backend Developer',
        jobDescription: 'Build APIs with Node.js, PostgreSQL, and distributed systems.',
      });
    applicationId = create.body.application.id;
  });

  afterAll(async () => {
    if (!applicationId) return;
    await request(app)
      .delete(`/api/applications/${applicationId}`)
      .set('Authorization', `Bearer ${token}`);
  });

  it('should generate a roadmap for a new application', async () => {
    const res = await request(app)
      .get(`/api/applications/${applicationId}/roadmap`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.roadmap.roleFocus).toBe('Backend');
    expect(res.body.roadmap.totalTopics).toBeGreaterThan(0);
    expect(res.body.roadmap.completionPercentage).toBe(0);
  });

  it('should mark a roadmap topic complete', async () => {
    const roadmap = await request(app)
      .get(`/api/applications/${applicationId}/roadmap`)
      .set('Authorization', `Bearer ${token}`);
    const topicId = roadmap.body.roadmap.topics[0].id;

    const res = await request(app)
      .put(`/api/roadmap-topics/${topicId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isCompleted: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.topic.is_completed).toBe(true);
    expect(res.body.roadmap.completedTopics).toBe(1);
    expect(res.body.roadmap.completionPercentage).toBeGreaterThan(0);
  });
});
