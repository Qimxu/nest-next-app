import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

/**
 * 全局 HTTP 异常过滤器
 * 统一处理所有异常并返回标准格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: any = null;

    // 处理 HTTP 异常
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        details = responseObj.details || null;

        // 处理 class-validator 的验证错误
        if (Array.isArray(responseObj.message)) {
          details = responseObj.message;
          message = 'Validation failed';
        }
      }
    } else if (exception instanceof Error) {
      // 处理普通错误
      message = exception.message;
      this.logger.error(
        `Exception caught: ${exception.message}`,
        exception.stack,
      );
    }

    // 构建响应
    const errorResponse: ApiResponse = {
      code: status,
      message,
      data: details || null,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // 记录错误日志
    this.logger.error(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
      details ? JSON.stringify(details) : '',
    );

    response.status(status).json(errorResponse);
  }
}
