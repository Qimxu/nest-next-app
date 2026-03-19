import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import {
  THROTTLE_KEY,
  type ThrottleOptions,
} from '../decorators/throttle.decorator';

type Counter = { count: number; resetAt: number };

@Injectable()
export class ThrottleInterceptor implements NestInterceptor {
  private readonly store = new Map<string, Counter>();
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    this.startCleanup();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<any>();

    const options =
      this.reflector.getAllAndOverride<ThrottleOptions>(THROTTLE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? null;

    // No @Throttle decorator → no rate limiting
    if (!options) return next.handle();

    const ttlMs =
      options.ttlMs ?? Number(this.configService.get('throttle.ttl')) ?? 60_000;
    const limit =
      options.limit ?? Number(this.configService.get('throttle.limit')) ?? 100;

    const now = Date.now();
    const key = this.getClientKey(req, context);
    const windowKey = `${key}:${context.getHandler().name}`;
    const entry = this.store.get(windowKey);

    if (!entry || entry.resetAt <= now) {
      this.store.set(windowKey, { count: 1, resetAt: now + ttlMs });
      this.setHeaders(req, ttlMs, limit, limit - 1, now + ttlMs);
      return next.handle();
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);
    this.setHeaders(req, ttlMs, limit, remaining, entry.resetAt);

    if (entry.count > limit) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later.',
          errorCode: 'TOO_MANY_REQUESTS',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return next.handle();
  }

  private setHeaders(
    req: any,
    _ttlMs: number,
    limit: number,
    remaining: number,
    resetAt: number,
  ) {
    const res = req?.res;
    if (!res?.setHeader) return;
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetAt);
  }

  private getClientKey(req: any, context: ExecutionContext) {
    const userId = req?.user?.userId ?? req?.user?.id;
    if (userId) return `user:${userId}`;
    const ip =
      req?.ip ??
      req?.headers?.['x-forwarded-for']?.split(',')?.[0]?.trim() ??
      req?.socket?.remoteAddress ??
      'unknown';
    const route = context.getClass()?.name ?? 'unknown';
    return `ip:${ip}:${route}`;
  }

  private startCleanup() {
    if (this.cleanupTimer) return;
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [k, v] of this.store.entries()) {
        if (v.resetAt <= now) this.store.delete(k);
      }
    }, 60_000);
    this.cleanupTimer.unref?.();
  }
}
