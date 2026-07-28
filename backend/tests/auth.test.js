const request = require('supertest');
const app = require('../server');

describe('Auth API Unit Tests', () => {
  it('GET /health - should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  it('POST /api/auth/register - should create candidate user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Candidate',
        email: `candidate_${Date.now()}@test.com`,
        password: 'password123',
        role: 'candidate',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});
