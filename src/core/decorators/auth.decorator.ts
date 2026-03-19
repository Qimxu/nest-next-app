import { SetMetadata } from '@nestjs/common';

export const AUTH_KEY = 'auth';

/**
 * 标记接口需要登录认证
 * 不使用此装饰器的接口默认公开访问
 *
 * @example
 * @Auth()
 * @Get('profile')
 * getProfile() {}
 */
export const Auth = () => SetMetadata(AUTH_KEY, true);
