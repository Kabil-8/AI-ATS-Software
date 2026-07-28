const request = require('supertest');
const app = require('../server');

describe('Job Board API Tests', () => {
  it('GET /api/jobs - should return job postings list', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.jobs)).toBe(true);
  });
});
