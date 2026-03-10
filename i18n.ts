import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { locales, defaultLocale, type Locale, isValidLocale } from './i18n.config';

export { locales, defaultLocale, localeNames, localeDirection, type Locale, isValidLocale } from './i18n.config';

export default getRequestConfig(async () => {
  // 尝试从 cookie 获取语言设置
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined;

  // 验证 cookie 中的语言是否有效
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return {
      locale: cookieLocale,
      messages: (await import(`./messages/${cookieLocale}.json`)).default,
    };
  }

  // 默认语言
  return {
    locale: defaultLocale,
    messages: (await import(`./messages/${defaultLocale}.json`)).default,
  };
});
