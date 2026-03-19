import * as Joi from 'joi';

/**
 * 环境变量验证 Schema
 */
export const validationSchema = Joi.object({
  // 应用配置
  NODE_ENV: Joi.string()
    .valid('development', 'sit', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // 数据库配置
  DB_TYPE: Joi.string().default('mysql'),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().default('root'),
  DB_PASSWORD: Joi.string().allow('').default(''),
  DB_DATABASE: Joi.string().default('nest_next_app'),
  DB_SYNCHRONIZE: Joi.boolean().default(false),

  // Redis 配置
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),
  REDIS_DB: Joi.number().default(0),

  // JWT 配置 - 开发环境可选，生产环境必需
  JWT_SECRET: Joi.string()
    .min(32)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .description('JWT secret key must be at least 32 characters in production'),
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .description(
      'JWT refresh secret key must be at least 32 characters in production',
    ),
  JWT_EXPIRES_IN: Joi.string().default('30m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // API 限流配置
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(100),
});

/**
 * 配置选项
 */
export const validationOptions: Joi.ValidationOptions = {
  allowUnknown: true,
  abortEarly: true,
};
