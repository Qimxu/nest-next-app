import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

/**
 * Winston 日志服务
 */
@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');
    const env = process.env.NODE_ENV || 'development';
    const isProduction = env === 'production';

    // 定义日志格式
    const customFormat = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(
        ({ timestamp, level, message, context, stack, ...meta }) => {
          const contextStr = context ? `[${context}] ` : '';
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const stackStr = stack ? `\n${stack}` : '';
          return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}${metaStr}${stackStr}`;
        },
      ),
    );

    // 定义控制台格式（带颜色）
    const consoleFormat = winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(
        ({ timestamp, level, message, context, stack, ...meta }) => {
          const contextStr = context ? `[${context}] ` : '';
          const metaStr = Object.keys(meta).length
            ? JSON.stringify(meta, null, 2)
            : '';
          const stackStr = stack ? `\n${stack}` : '';
          return `${timestamp} [${level}] ${contextStr}${message}${metaStr}${stackStr}`;
        },
      ),
    );

    // 创建 Winston logger
    this.logger = winston.createLogger({
      level: isProduction ? 'info' : 'debug',
      defaultMeta: { service: 'nest-next-app' },
      transports: [
        // 控制台输出
        new winston.transports.Console({
          format: consoleFormat,
        }),
        // 错误日志文件
        new winston.transports.File({
          filename: path.join(logDir, 'error.log'),
          level: 'error',
          format: customFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // 所有日志文件
        new winston.transports.File({
          filename: path.join(logDir, 'combined.log'),
          format: customFormat,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
      ],
      // 处理未捕获的异常
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'exceptions.log'),
          format: customFormat,
        }),
      ],
      // 处理未处理的 Promise 拒绝
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(logDir, 'rejections.log'),
          format: customFormat,
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { context, stack: trace });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // 可选：设置日志级别
  setLogLevels?(levels: readonly string[]): any {
    // Map string log levels to Winston levels
    const levelMap: Record<string, string> = {
      log: 'info',
      error: 'error',
      warn: 'warn',
      debug: 'debug',
      verbose: 'verbose',
    };
    // Set the highest level from the provided levels
    if (levels.length > 0) {
      const winstonLevel = levelMap[levels[0]] || 'info';
      this.logger.level = winstonLevel;
    }
  }
}
