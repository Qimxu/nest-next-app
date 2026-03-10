import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 业务异常基类
 */
export class BusinessException extends HttpException {
  private readonly errorCode: string;

  constructor(
    message: string,
    errorCode: string = 'BUSINESS_ERROR',
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        statusCode,
        message,
        errorCode,
      },
      statusCode,
    );
    this.errorCode = errorCode;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
}

/**
 * 资源未找到异常
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}

/**
 * 未授权异常
 */
export class AuthUnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', HttpStatus.UNAUTHORIZED);
  }
}

/**
 * 禁止访问异常
 */
export class AccessForbiddenException extends BusinessException {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', HttpStatus.FORBIDDEN);
  }
}

/**
 * 参数验证失败异常
 */
export class ValidationErrorException extends BusinessException {
  constructor(message: string = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', HttpStatus.BAD_REQUEST);
  }
}

/**
 * 数据冲突异常 (如唯一键冲突)
 */
export class DataConflictException extends BusinessException {
  constructor(message: string = 'Conflict') {
    super(message, 'CONFLICT', HttpStatus.CONFLICT);
  }
}

/**
 * 服务不可用异常
 */
export class ServiceUnavailableException extends BusinessException {
  constructor(message: string = 'Service unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', HttpStatus.SERVICE_UNAVAILABLE);
  }
}

/**
 * 请求过于频繁异常
 */
export class RateLimitException extends BusinessException {
  constructor(message: string = 'Too many requests') {
    super(message, 'TOO_MANY_REQUESTS', HttpStatus.TOO_MANY_REQUESTS);
  }
}
