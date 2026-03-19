import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 安全序列化对象，避免循环引用
 */
function safeStringify(obj: any, maxLength: number = 500): string {
  if (obj === null || obj === undefined) {
    return String(obj);
  }

  // 基本类型直接返回
  if (typeof obj !== 'object') {
    const str = String(obj);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  // Buffer、Stream、Socket 等特殊对象
  if (Buffer.isBuffer(obj)) {
    return `<Buffer ${obj.length} bytes>`;
  }
  if (typeof obj.pipe === 'function') {
    return '<Stream>';
  }
  if (obj.constructor?.name === 'Socket') {
    return '<Socket>';
  }
  if (obj.constructor?.name === 'ServerResponse') {
    return '<ServerResponse>';
  }
  if (obj.constructor?.name === 'IncomingMessage') {
    return '<IncomingMessage>';
  }

  // 数组
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    if (obj.length > 5) {
      const preview = obj.slice(0, 3).map((item) => safeStringify(item, 100));
      return `[${preview.join(', ')}... +${obj.length - 3} more]`;
    }
    const items = obj.map((item) => safeStringify(item, 100));
    return `[${items.join(', ')}]`;
  }

  // 普通对象
  try {
    const seen = new WeakSet();
    const result = JSON.stringify(obj, (key, value) => {
      // 跳过循环引用
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      // 跳过特殊对象
      if (value?.constructor?.name === 'Socket' ||
          value?.constructor?.name === 'ServerResponse' ||
          value?.constructor?.name === 'IncomingMessage') {
        return `<${value.constructor.name}>`;
      }
      return value;
    });

    if (result && result.length > maxLength) {
      return result.substring(0, maxLength) + '...';
    }
    return result || '{}';
  } catch (e) {
    return `<Unable to serialize: ${e.message}>`;
  }
}

@Injectable()
export class LogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const startTime = Date.now();

    // 记录请求
    this.logger.log(
      `[${method}] ${url} - [${className}.${handlerName}]`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const dataPreview = safeStringify(data);
          this.logger.log(
            `[${method}] ${url} - [${className}.${handlerName}] - ${duration}ms - ${dataPreview}`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${method}] ${url} - [${className}.${handlerName}] - ${duration}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}
