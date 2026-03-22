import { SecurityMiddleware } from './security.middleware';
import { Request, NextFunction } from 'express';

const createMockRes = () => {
  const headers: Record<string, string> = {};
  return {
    setHeader: jest.fn((key: string, val: string) => {
      headers[key] = val;
    }),
    removeHeader: jest.fn(),
    _headers: headers,
  };
};

describe('SecurityMiddleware', () => {
  let middleware: SecurityMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new SecurityMiddleware();
    next = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next()', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should set Content-Security-Policy header', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.stringContaining("default-src 'self'"),
    );
  });

  it('should set X-XSS-Protection header', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-XSS-Protection',
      '1; mode=block',
    );
  });

  it('should set X-Content-Type-Options to nosniff', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
  });

  it('should set X-Frame-Options to DENY', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
  });

  it('should set Strict-Transport-Security header', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.stringContaining('max-age=31536000'),
    );
  });

  it('should set Referrer-Policy header', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Referrer-Policy',
      'strict-origin-when-cross-origin',
    );
  });

  it('should remove X-Powered-By header', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.removeHeader).toHaveBeenCalledWith('X-Powered-By');
  });

  it('should set Permissions-Policy header', () => {
    const res = createMockRes();
    middleware.use({} as Request, res as any, next);
    expect(res.setHeader).toHaveBeenCalledWith(
      'Permissions-Policy',
      expect.stringContaining('geolocation=()'),
    );
  });
});
