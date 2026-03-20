import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';

/**
 * ANSI 颜色代码
 */
const ConsoleColors = {
  NEST: {
    LABEL: '\x1b[45m\x1b[37m', // 紫色背景白字
    METHOD: '\x1b[95m', // 亮紫色方法
    PATH: '\x1b[35m', // 紫色路径
    CONTROLLER: '\x1b[35m', // 紫色控制器
    RESET: '\x1b[0m',
  },
  NEXT: {
    LABEL: '\x1b[44m\x1b[37m', // 蓝色背景白字
    METHOD: '\x1b[96m', // 青色方法
    PATH: '\x1b[34m', // 蓝色路径
    RESET: '\x1b[0m',
  },
  COMMON: {
    TIMESTAMP: '\x1b[90m', // 灰色时间戳
    DURATION: '\x1b[33m', // 黄色耗时
    ERROR: '\x1b[31m', // 红色错误
    WARN: '\x1b[33m', // 黄色警告
    INFO: '\x1b[32m', // 绿色信息
    DEBUG: '\x1b[36m', // 青色调试
    DATA: '\x1b[37m', // 白色数据
    RESET: '\x1b[0m',
  },
};

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

    // 定义日志格式（文件输出，无颜色）
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

    // 定义控制台格式（带自定义颜色）
    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.printf(
        ({ timestamp, level, message, context, stack, ..._meta }) => {
          const c = ConsoleColors;
          const timestampStr = `${c.COMMON.TIMESTAMP}${timestamp}${c.COMMON.RESET}`;
          const msgStr =
            typeof message === 'string' ? message : String(message);

          // 根据日志内容判断类型
          let levelStr: string;
          if (msgStr.includes('[API]') || context === 'API') {
            // Nest API 日志 - 紫色
            levelStr = `${c.NEST.LABEL} API ${c.NEST.RESET}`;
          } else if (
            msgStr.includes('[NEXT]') ||
            msgStr.includes('STATIC') ||
            msgStr.includes('PAGE')
          ) {
            // Next.js 日志 - 蓝色
            levelStr = `${c.NEXT.LABEL} NEXT ${c.NEXT.RESET}`;
          } else {
            // 普通日志
            const levelColors: Record<string, string> = {
              error: c.COMMON.ERROR,
              warn: c.COMMON.WARN,
              info: c.COMMON.INFO,
              debug: c.COMMON.DEBUG,
            };
            levelStr = `${levelColors[level] || c.COMMON.INFO}[${level.toUpperCase()}]${c.COMMON.RESET}`;
          }

          const contextStr =
            context && !msgStr.includes('[API]') && !msgStr.includes('[NEXT]')
              ? `${c.COMMON.TIMESTAMP}[${context}]${c.COMMON.RESET} `
              : '';

          const messageStr = `${c.COMMON.DATA}${msgStr}${c.COMMON.RESET}`;
          const stackStr = stack
            ? `\n${c.COMMON.ERROR}${stack}${c.COMMON.RESET}`
            : '';

          return `${timestampStr} ${levelStr} ${contextStr}${messageStr}${stackStr}`;
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
