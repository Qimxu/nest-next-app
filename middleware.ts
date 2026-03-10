import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n.config';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export const config = {
  // 匹配所有路径除了 api、_next、静态文件等
  matcher: ['/', '/(en|zh)/:path*'],
};
