import { LogInterceptor } from './log.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

const createMockContext = (
  options: {
    url?: string;
    method?: string;
    handlerName?: string;
    className?: string;
    ip?: string;
  } = {},
) => {
  const {
    url = '/api/users',
    method = 'GET',
    handlerName = 'getUsers',
    className = 'UsersController',
    ip = '127.0.0.1',
  } = options;

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ url, method, ip }),
    }),
    getHandler: jest.fn().mockReturnValue({ name: handlerName }),
    getClass: jest.fn().mockReturnValue({ name: className }),
  } as unknown as ExecutionContext;
};

describe('LogInterceptor', () => {
  let interceptor: LogInterceptor;

  beforeEach(() => {
    interceptor = new LogInterceptor();
    jest.spyOn(interceptor['logger'], 'log').mockImplementation(() => {});
    jest.spyOn(interceptor['logger'], 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through response for NestJS API requests', (done) => {
    const context = createMockContext({ url: '/api/users' });
    const callHandler: CallHandler = { handle: () => of({ data: 'test' }) };

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toEqual({ data: 'test' });
      done();
    });
  });

  it('should pass through response for Next.js page requests', (done) => {
    const context = createMockContext({
      url: '/',
      method: 'GET',
      handlerName: 'renderPage',
    });
    const callHandler: CallHandler = { handle: () => of('<html>page</html>') };

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toBe('<html>page</html>');
      done();
    });
  });

  it('should pass through for _next static asset requests', (done) => {
    const context = createMockContext({ url: '/_next/static/chunk.js' });
    const callHandler: CallHandler = { handle: () => of('JS content') };

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toBe('JS content');
      done();
    });
  });

  it('should not suppress errors from handlers', (done) => {
    const context = createMockContext({ url: '/api/error' });
    const error = new Error('handler error');
    const callHandler: CallHandler = { handle: () => throwError(() => error) };

    interceptor.intercept(context, callHandler).subscribe({
      error: (err) => {
        expect(err).toBe(error);
        done();
      },
    });
  });

  it('should handle POST requests', (done) => {
    const context = createMockContext({
      url: '/api/auth/login',
      method: 'POST',
    });
    const callHandler: CallHandler = {
      handle: () => of({ access_token: 'tok' }),
    };

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toHaveProperty('access_token');
      done();
    });
  });

  it('should handle DELETE requests', (done) => {
    const context = createMockContext({
      url: '/api/users/1',
      method: 'DELETE',
    });
    const callHandler: CallHandler = {
      handle: () => of({ message: 'deleted' }),
    };

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toHaveProperty('message');
      done();
    });
  });

  it('should handle null/undefined responses', (done) => {
    const context = createMockContext({ url: '/api/test' });
    const callHandler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, callHandler).subscribe((val) => {
      expect(val).toBeNull();
      done();
    });
  });
});
