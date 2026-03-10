/**
 * 国际化统一配置文件
 * 包含所有语言相关的常量、类型和配置
 */

// ============================================
// 语言类型定义
// ============================================
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

// ============================================
// 语言显示配置
// ============================================
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
};

export const localeDirection: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  zh: 'ltr',
};

// ============================================
// 语言验证工具
// ============================================
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleName(locale: Locale): string {
  return localeNames[locale];
}

// ============================================
// 语言配置对象（供 next-intl 使用）
// ============================================
export const localeConfig = {
  locales,
  defaultLocale,
};
