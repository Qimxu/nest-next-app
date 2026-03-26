import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of } from 'rxjs';
import { ThrottleInterceptor } from './throttle.interceptor';

const createMockContext = (
  ip = '127.0.0.1',
  user: any = null,
  handlerName = 'testHandler',
  throttleOptions: any = null,
) => {
  const mockRequest = {
    ip,
    user,
    headers: {},
    socket: { remoteAddress: ip },
    res: { setHeader: jest.fn() },
  };
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
    getHandler: jest.fn().mockReturnValue({ name: handlerName }),
    getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
    throttleOptions,
    mockRequest,
  };
};

describe('ThrottleInterceptor', () => {
  let interceptor: ThrottleInterceptor;
  let reflector: jest.Mocked<Reflector>;

  const callHandler = { handle: () => of('response') };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThrottleInterceptor,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(undefined) },
        },
      ],
    }).compile();

    interceptor = module.get<ThrottleInterceptor>(ThrottleInterceptor);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through when no throttle options set', (done) => {
    reflector.getAllAndOverride.mockReturnValue(null);
    const context = createMockContext() as any;

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toBe('response');
      done();
    });
  });

  it('should allow requests within rate limit', (done) => {
    reflector.getAllAndOverride.mockReturnValue({ ttlMs: 60000, limit: 5 });
    const context = createMockContext('192.168.1.1', null, 'login') as any;

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toBe('response');
      done();
    });
  });

  it('should throw 429 when rate limit exceeded', (done) => {
    reflector.getAllAndOverride.mockReturnValue({ ttlMs: 60000, limit: 2 });
    const context = createMockContext('10.0.0.1', null, 'register') as any;

    // First 2 requests succeed
    interceptor.intercept(context, callHandler).subscribe(() => {
      interceptor.intercept(context, callHandler).subscribe(() => {
        // 3rd request should be throttled synchronously
        try {
          interceptor.intercept(context, callHandler);
          done.fail('Expected HttpException to be thrown');
        } catch (err: any) {
          expect(err).toBeInstanceOf(HttpException);
          expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
          expect(err.getResponse()).toMatchObject({
            errorCode: 'TOO_MANY_REQUESTS',
          });
          done();
        }
      });
    });
  });

  it('should use user-based key when user is authenticated', (done) => {
    reflector.getAllAndOverride.mockReturnValue({ ttlMs: 60000, limit: 10 });
    const context = createMockContext(
      '127.0.0.1',
      { userId: 42 },
      'protectedAction',
    ) as any;

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toBe('response');
      done();
    });
  });

  it('should set X-RateLimit headers on response', (done) => {
    reflector.getAllAndOverride.mockReturnValue({ ttlMs: 60000, limit: 100 });
    const context = createMockContext('172.16.0.1', null, 'testHeaders') as any;

    interceptor.intercept(context, callHandler).subscribe(() => {
      expect(context.mockRequest.res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Limit',
        100,
      );
      expect(context.mockRequest.res.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        expect.any(Number),
      );
      done();
    });
  });

  it('should reset counter after TTL expires', (done) => {
    reflector.getAllAndOverride.mockReturnValue({ ttlMs: 50, limit: 1 });
    const context = createMockContext('10.0.0.2', null, 'shortTtl') as any;

    // First request succeeds
    interceptor.intercept(context, callHandler).subscribe(() => {
      // Second request should be throttled (synchronously)
      try {
        interceptor.intercept(context, callHandler);
        done.fail('Expected throttle on 2nd request');
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        // Wait for TTL to expire then retry
        setTimeout(() => {
          interceptor.intercept(context, callHandler).subscribe((val) => {
            expect(val).toBe('response');
            done();
          });
        }, 60);
      }
    });
  });
});
