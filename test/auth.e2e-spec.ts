import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/core/filters/http-exception.filter';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes and filters
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'E2E Test User',
          email: `e2e-test-${Date.now()}@example.com`,
          password: 'SecurePassword123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('access_token');
          expect(res.body.data).toHaveProperty('refresh_token');
          accessToken = res.body.data.access_token;
          refreshToken = res.body.data.refresh_token;
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short',
        })
        .expect(400);
    });

    it('should fail with missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/api/auth/login (POST)', () => {
    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    it('should refresh token successfully with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('access_token');
        });
    });

    it('should fail with invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);
    });
  });

  describe('/api/users/profile (GET)', () => {
    it('should return profile without authentication (public by default)', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty(
            'message',
            'Authenticated user profile',
          );
        });
    });

    it('should still return profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty(
            'message',
            'Authenticated user profile',
          );
        });
    });
  });

  describe('/api/users (GET)', () => {
    it('should return list of users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('users');
          expect(Array.isArray(res.body.data.users)).toBe(true);
        });
    });
  });

  describe('/api/redis/test (GET)', () => {
    it('should test Redis connection', () => {
      return request(app.getHttpServer())
        .get('/redis/test')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('status', 'connected');
          expect(res.body.data).toHaveProperty('write', 'success');
          expect(res.body.data).toHaveProperty('read', 'success');
        });
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('code', 200);
          expect(res.body).toHaveProperty('data');
          expect(res.body.data).toHaveProperty('status', 'ok');
          expect(res.body.data).toHaveProperty('timestamp');
        });
    });
  });
});
