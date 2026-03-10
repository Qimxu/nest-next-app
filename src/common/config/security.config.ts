import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS 配置
 */
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // 允许的源列表
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    // 开发环境允许所有源
    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    // 允许无 origin 的请求 (如移动应用、Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    // 检查是否在允许列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Request-ID',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page',
    'X-Page-Size',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 3600, // 预检请求缓存 1 小时
};
