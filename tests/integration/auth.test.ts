import request from 'supertest';
import app from '../../src/app';
import { prisma } from '../../src/config/database';

describe('Authentication Endpoints', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.token).toBeDefined();
    });

    it('should not register with existing email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User already exists');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      
      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrong' });
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      token = res.body.token;
    });

    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should not get profile without token', async () => {
      const response = await request(app).get('/api/auth/profile');
      expect(response.status).toBe(401);
    });
  });
});