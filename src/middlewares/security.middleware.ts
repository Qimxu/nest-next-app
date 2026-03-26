import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 安全头部中间件
 * 添加各种 HTTP 安全头部
 */
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 内容安全策略
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "connect-src 'self' https:; " +
        "frame-ancestors 'none';",
    );

    // 防止 XSS 攻击
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // 防止 MIME 类型嗅探
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // 防止点击劫持
    res.setHeader('X-Frame-Options', 'DENY');

    // 严格传输安全 (HSTS)
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );

    // 引用策略
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // 权限策略
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), microphone=(), camera=(), payment=()',
    );

    // 移除 X-Powered-By 头部
    res.removeHeader('X-Powered-By');

    next();
  }
}
