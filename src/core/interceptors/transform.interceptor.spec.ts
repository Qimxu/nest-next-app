import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

const createMockContext = (url = '/api/test') => ({
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue({ url }),
  }),
  getHandler: jest.fn(),
  getClass: jest.fn(),
});

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap data in standard response format', (done) => {
    const context = createMockContext() as unknown as ExecutionContext;
    const callHandler: CallHandler = {
      handle: () => of({ id: 1, name: 'Test' }),
    };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result.code).toBe(200);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(result.timestamp).toBeDefined();
      expect(result.path).toBe('/api/test');
      done();
    });
  });

  it('should set data to null when handler returns null', (done) => {
    const context = createMockContext() as unknown as ExecutionContext;
    const callHandler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result.data).toBeNull();
      done();
    });
  });

  it('should set data to null when handler returns undefined', (done) => {
    const context = createMockContext() as unknown as ExecutionContext;
    const callHandler: CallHandler = { handle: () => of(undefined) };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result.data).toBeNull();
      done();
    });
  });

  it('should wrap array data', (done) => {
    const context = createMockContext() as unknown as ExecutionContext;
    const callHandler: CallHandler = {
      handle: () => of([{ id: 1 }, { id: 2 }]),
    };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result.data).toHaveLength(2);
      done();
    });
  });

  it('should include correct path from request url', (done) => {
    const context = createMockContext(
      '/api/users/profile',
    ) as unknown as ExecutionContext;
    const callHandler: CallHandler = { handle: () => of({}) };

    interceptor.intercept(context, callHandler).subscribe((result) => {
      expect(result.path).toBe('/api/users/profile');
      done();
    });
  });
});
