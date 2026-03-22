import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

const createMockContext = (
  options: {
    path?: string;
    authHeader?: string;
  } = {},
) => {
  const { path = '/api/users', authHeader } = options;
  const headers: Record<string, string> = {};
  if (authHeader) headers['authorization'] = authHeader;

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ path, headers }),
    }),
    getHandler: jest.fn().mockReturnValue({}),
    getClass: jest.fn().mockReturnValue({}),
  } as unknown as ExecutionContext;
};

// Mock passport AuthGuard
jest.mock('@nestjs/passport', () => ({
  AuthGuard: (_strategy: string) => {
    class MockAuthGuard {
      async canActivate(_context: ExecutionContext) {
        return true;
      }
      handleRequest(err: any, user: any) {
        if (err || !user)
          throw err || new UnauthorizedException('Invalid token');
        return user;
      }
    }
    return MockAuthGuard;
  },
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow /_next static asset paths without authentication', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({ path: '/_next/static/chunk.js' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow /static paths without authentication', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({ path: '/static/logo.png' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow @Public() routes without JWT verification', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = createMockContext({ path: '/api/auth/login' });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should proceed to JWT validation for protected routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = createMockContext({
      path: '/api/users',
      authHeader: 'Bearer valid.jwt.token',
    });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('handleRequest should throw UnauthorizedException when no user', () => {
    expect(() => guard.handleRequest(null, null, null, {} as any)).toThrow(
      UnauthorizedException,
    );
  });

  it('handleRequest should throw the original error when err is provided', () => {
    const err = new UnauthorizedException('Token expired');
    expect(() => guard.handleRequest(err, null, null, {} as any)).toThrow(err);
  });

  it('handleRequest should return user and attach token to request', () => {
    const mockUser = { userId: 1, email: 'test@example.com', role: 'user' };
    const mockRequest = {
      headers: { authorization: 'Bearer my.token.here' },
      token: null,
    };
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    const result = guard.handleRequest(null, mockUser, null, context);
    expect(result).toBe(mockUser);
    expect(mockRequest.token).toBe('my.token.here');
  });

  it('handleRequest should set token to null when no Authorization header', () => {
    const mockUser = { userId: 1, email: 'test@example.com', role: 'user' };
    const mockRequest = { headers: {}, token: undefined };
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;

    guard.handleRequest(null, mockUser, null, context);
    expect(mockRequest.token).toBeNull();
  });
});
