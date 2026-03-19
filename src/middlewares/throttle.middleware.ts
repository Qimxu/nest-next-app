import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * 简单的内存限流中间件
 * 生产环境建议使用 Redis 存储
 */
@Injectable()
export class ThrottleMiddleware implements NestMiddleware {
  private readonly store: RateLimitStore = {};
  private readonly windowMs = 60000; // 1 分钟
  private readonly maxRequests = 100; // 100 次请求
  private readonly message = 'Too many requests, please try again later.';
  private readonly cleanupTimer: NodeJS.Timeout;

  constructor() {
    // 定期清理过期记录
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      Object.keys(this.store).forEach((key) => {
        if (this.store[key].resetTime < now) {
          delete this.store[key];
        }
      });
    }, this.windowMs);

    // Avoid keeping Node process alive (tests/CI)
    this.cleanupTimer.unref?.();
  }

  use(req: Request, res: Response, next: NextFunction) {
    const clientId = this.getClientId(req);
    const now = Date.now();

    if (!this.store[clientId] || this.store[clientId].resetTime < now) {
      this.store[clientId] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    this.store[clientId].count++;

    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, this.maxRequests - this.store[clientId].count),
    );
    res.setHeader('X-RateLimit-Reset', this.store[clientId].resetTime);

    if (this.store[clientId].count > this.maxRequests) {
      const retryAfter = Math.ceil(
        (this.store[clientId].resetTime - now) / 1000,
      );
      res.setHeader('Retry-After', retryAfter);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: this.message,
          errorCode: 'TOO_MANY_REQUESTS',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    next();
  }

  private getClientId(req: Request): string {
    const user = (req as any).user;
    if (user?.id) {
      return `user:${user.id}`;
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `ip:${ip}`;
  }
}
