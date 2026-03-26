import { HttpStatus } from '@nestjs/common';
import {
  BusinessException,
  ResourceNotFoundException,
  AuthUnauthorizedException,
  AccessForbiddenException,
  ValidationErrorException,
  DataConflictException,
  ServiceUnavailableException,
  RateLimitException,
} from './business.exception';

describe('BusinessException', () => {
  it('should create with default errorCode and status', () => {
    const ex = new BusinessException('Something went wrong');
    expect(ex.getErrorCode()).toBe('BUSINESS_ERROR');
    expect(ex.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    const response = ex.getResponse() as any;
    expect(response.message).toBe('Something went wrong');
    expect(response.errorCode).toBe('BUSINESS_ERROR');
  });

  it('should create with custom errorCode and status', () => {
    const ex = new BusinessException(
      'Custom error',
      'CUSTOM_CODE',
      HttpStatus.CONFLICT,
    );
    expect(ex.getErrorCode()).toBe('CUSTOM_CODE');
    expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
  });

  it('should be an instance of HttpException', () => {
    const ex = new BusinessException('error');
    expect(ex).toBeInstanceOf(Error);
  });
});

describe('ResourceNotFoundException', () => {
  it('should use default "Resource" label', () => {
    const ex = new ResourceNotFoundException();
    expect(ex.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(ex.getErrorCode()).toBe('NOT_FOUND');
    const response = ex.getResponse() as any;
    expect(response.message).toContain('Resource');
  });

  it('should use custom resource label', () => {
    const ex = new ResourceNotFoundException('User');
    const response = ex.getResponse() as any;
    expect(response.message).toBe('User not found');
  });
});

describe('AuthUnauthorizedException', () => {
  it('should default to Unauthorized', () => {
    const ex = new AuthUnauthorizedException();
    expect(ex.getStatus()).toBe(HttpStatus.UNAUTHORIZED);
    expect(ex.getErrorCode()).toBe('UNAUTHORIZED');
  });

  it('should use custom message', () => {
    const ex = new AuthUnauthorizedException('Token expired');
    const response = ex.getResponse() as any;
    expect(response.message).toBe('Token expired');
  });
});

describe('AccessForbiddenException', () => {
  it('should default to Forbidden', () => {
    const ex = new AccessForbiddenException();
    expect(ex.getStatus()).toBe(HttpStatus.FORBIDDEN);
    expect(ex.getErrorCode()).toBe('FORBIDDEN');
  });

  it('should use custom message', () => {
    const ex = new AccessForbiddenException('No permission');
    const response = ex.getResponse() as any;
    expect(response.message).toBe('No permission');
  });
});

describe('ValidationErrorException', () => {
  it('should default to Validation failed', () => {
    const ex = new ValidationErrorException();
    expect(ex.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(ex.getErrorCode()).toBe('VALIDATION_ERROR');
  });

  it('should use custom validation message', () => {
    const ex = new ValidationErrorException('Email is invalid');
    const response = ex.getResponse() as any;
    expect(response.message).toBe('Email is invalid');
  });
});

describe('DataConflictException', () => {
  it('should default to Conflict', () => {
    const ex = new DataConflictException();
    expect(ex.getStatus()).toBe(HttpStatus.CONFLICT);
    expect(ex.getErrorCode()).toBe('CONFLICT');
  });

  it('should use custom conflict message', () => {
    const ex = new DataConflictException('Email already exists');
    const response = ex.getResponse() as any;
    expect(response.message).toBe('Email already exists');
  });
});

describe('ServiceUnavailableException', () => {
  it('should default to Service unavailable', () => {
    const ex = new ServiceUnavailableException();
    expect(ex.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    expect(ex.getErrorCode()).toBe('SERVICE_UNAVAILABLE');
  });
});

describe('RateLimitException', () => {
  it('should default to Too many requests', () => {
    const ex = new RateLimitException();
    expect(ex.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect(ex.getErrorCode()).toBe('TOO_MANY_REQUESTS');
  });

  it('should use custom rate limit message', () => {
    const ex = new RateLimitException('Please wait 30 seconds');
    const response = ex.getResponse() as any;
    expect(response.message).toBe('Please wait 30 seconds');
  });
});
