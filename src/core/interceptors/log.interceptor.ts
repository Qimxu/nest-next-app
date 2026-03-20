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
 * ANSI 颜色代码
 */
const Colors = {
  // Nest API - 紫色
  NEST: {
    BRACKET: '\x1b[35m', // [API]
    METHOD: '\x1b[95m', // GET/POST 等方法
    PATH: '\x1b[35m', // /api/xxx 路径
    CONTROLLER: '\x1b[35m', // Controller 名称
    RESET: '\x1b[0m',
  },
  // Next.js - 蓝色
  NEXT: {
    BRACKET: '\x1b[34m', // [NEXT]
    METHOD: '\x1b[96m', // 资源类型
    PATH: '\x1b[34m', // 页面/资源路径
    RESOURCE: '\x1b[94m', // 静态资源
    RESET: '\x1b[0m',
  },
  // 通用
  COMMON: {
    TIME: '\x1b[90m', // 时间戳 - 灰色
    DURATION: '\x1b[33m', // 耗时 - 黄色
    ERROR: '\x1b[31m', // 错误 - 红色
    SUCCESS: '\x1b[32m', // 成功 - 绿色
    DATA: '\x1b[32m', // 数据 - 绿色
    RESET: '\x1b[0m',
  },
};

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
      if (
        value?.constructor?.name === 'Socket' ||
        value?.constructor?.name === 'ServerResponse' ||
        value?.constructor?.name === 'IncomingMessage'
      ) {
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

  /**
   * 判断是否为 Next.js 相关请求
   */
  private isNextRequest(url: string): boolean {
    // Next.js 资源：/_next/、静态文件、页面路由等
    return (
      url.startsWith('/_next/') ||
      url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/) !==
        null ||
      (!url.startsWith('/api/') && !url.startsWith('/auth/'))
    );
  }

  /**
   * 格式化 Nest API 日志（紫色主题）
   */
  private formatNestLog(
    method: string,
    url: string,
    className: string,
    handlerName: string,
    duration?: number,
    data?: string,
    _isError?: boolean,
  ): string {
    const c = Colors.NEST;
    const common = Colors.COMMON;

    let log = `${c.BRACKET}[API]${c.RESET} ${c.METHOD}${method}${c.RESET} ${c.PATH}${url}${c.RESET} ${c.CONTROLLER}[${className}.${handlerName}]${c.RESET}`;

    if (duration !== undefined) {
      log += ` ${common.DURATION}${duration}ms${common.RESET}`;
    }

    if (data) {
      log += ` ${common.DATA}${data}${common.RESET}`;
    }

    return log;
  }

  /**
   * 格式化 Next.js 日志（蓝色主题）
   */
  private formatNextLog(
    method: string,
    url: string,
    duration?: number,
    _data?: string,
    _isError?: boolean,
  ): string {
    const c = Colors.NEXT;
    const common = Colors.COMMON;

    // 简化 Next.js 资源路径显示
    const resourceType = this.getResourceType(url);
    let log = `${c.BRACKET}[NEXT]${c.RESET} ${c.METHOD}${resourceType}${c.RESET} ${c.PATH}${url}${c.RESET}`;

    if (duration !== undefined) {
      log += ` ${common.DURATION}${duration}ms${common.RESET}`;
    }

    return log;
  }

  /**
   * 获取资源类型
   */
  private getResourceType(url: string): string {
    if (url.startsWith('/_next/static/')) return 'STATIC';
    if (url.startsWith('/_next/data/')) return 'DATA';
    if (url.startsWith('/_next/image')) return 'IMAGE';
    if (url.startsWith('/_next/')) return 'WEBPACK';
    if (url.match(/\.(js|ts)x?$/)) return 'SCRIPT';
    if (url.match(/\.css$/)) return 'STYLE';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'ASSET';
    return 'PAGE';
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    const startTime = Date.now();
    const isNext = this.isNextRequest(url);

    // 记录请求
    if (isNext) {
      // Next.js 请求 - 蓝色
      console.log(this.formatNextLog(method, url));
    } else {
      // Nest API 请求 - 紫色
      console.log(this.formatNestLog(method, url, className, handlerName));
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const dataPreview = safeStringify(data);

          if (isNext) {
            console.log(this.formatNextLog(method, url, duration));
          } else {
            console.log(
              this.formatNestLog(
                method,
                url,
                className,
                handlerName,
                duration,
                dataPreview,
              ),
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const common = Colors.COMMON;

          if (isNext) {
            console.log(
              `${this.formatNextLog(method, url, duration)} ${common.ERROR}Error: ${error.message}${common.RESET}`,
            );
          } else {
            console.log(
              `${this.formatNestLog(method, url, className, handlerName, duration)} ${common.ERROR}Error: ${error.message}${common.RESET}`,
            );
          }
        },
      }),
    );
  }
}
