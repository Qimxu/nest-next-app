import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { of } from 'rxjs';
import { TokenBlacklistInterceptor } from './token-blacklist.interceptor';
import { RedisService } from '../redis/redis.service';

const createMockContext = (token?: string) => {
  const request = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    path: '/api/test',
  };
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
  };
};

describe('TokenBlacklistInterceptor', () => {
  let interceptor: TokenBlacklistInterceptor;
  let redisService: jest.Mocked<RedisService>;
  const callHandler = { handle: () => of('ok') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistInterceptor,
        {
          provide: RedisService,
          useValue: { exists: jest.fn() },
        },
      ],
    }).compile();

    interceptor = module.get<TokenBlacklistInterceptor>(
      TokenBlacklistInterceptor,
    );
    redisService = module.get(RedisService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should allow request when no token provided', async () => {
    const context = createMockContext() as any;
    const result = await interceptor.intercept(context, callHandler);
    expect(redisService.exists).not.toHaveBeenCalled();
    result.subscribe((val) => expect(val).toBe('ok'));
  });

  it('should allow request when token is not blacklisted', async () => {
    redisService.exists.mockResolvedValue(false);
    const context = createMockContext('valid_token') as any;
    const result = await interceptor.intercept(context, callHandler);
    expect(redisService.exists).toHaveBeenCalledWith(
      'token_blacklist:valid_token',
    );
    result.subscribe((val) => expect(val).toBe('ok'));
  });

  it('should throw UnauthorizedException when token is blacklisted', async () => {
    redisService.exists.mockResolvedValue(true);
    const context = createMockContext('blacklisted_token') as any;

    await expect(interceptor.intercept(context, callHandler)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should extract token from Bearer header', async () => {
    redisService.exists.mockResolvedValue(false);
    const context = createMockContext('my_access_token') as any;
    await interceptor.intercept(context, callHandler);
    expect(redisService.exists).toHaveBeenCalledWith(
      expect.stringContaining('my_access_token'),
    );
  });
});
