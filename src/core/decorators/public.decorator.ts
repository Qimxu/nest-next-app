import { SetMetadata } from '@nestjs/common';

export const PUBLIC_KEY = 'isPublic';

/**
 * 标记接口为公开访问（无需认证）
 * 不标记此装饰器的接口默认需要登录
 *
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() {}
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);
