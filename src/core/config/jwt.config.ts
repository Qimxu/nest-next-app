import { registerAs } from '@nestjs/config';

/**
 * JWT 配置
 */
export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    'your-jwt-refresh-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '30m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
