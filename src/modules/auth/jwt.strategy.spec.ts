import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'jwt.secret')
                return 'test_secret_key_32chars_minimum!!';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload and return user object', async () => {
    const payload = { sub: 1, email: 'test@example.com', role: 'user' };
    const result = await strategy.validate(payload);

    expect(result).toEqual({
      userId: 1,
      email: 'test@example.com',
      role: 'user',
    });
  });

  it('should map sub to userId', async () => {
    const payload = { sub: 42, email: 'another@example.com', role: 'admin' };
    const result = await strategy.validate(payload);
    expect(result.userId).toBe(42);
  });

  it('should preserve role from payload', async () => {
    const adminPayload = { sub: 1, email: 'admin@example.com', role: 'admin' };
    const result = await strategy.validate(adminPayload);
    expect(result.role).toBe('admin');
  });
});
