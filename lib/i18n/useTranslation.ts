'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useCallback } from 'react';

/**
 * 翻译 Hook
 * 提供便捷的翻译功能
 */
export function useTranslation(namespace?: string) {
  const t = useTranslations(namespace);
  const locale = useLocale();

  /**
   * 获取带参数的翻译
   */
  const tWithParams = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return t(key, params);
    },
    [t],
  );

  /**
   * 检查翻译键是否存在
   */
  const hasKey = useCallback(
    (key: string) => {
      try {
        const value = t(key);
        return value !== key;
      } catch {
        return false;
      }
    },
    [t],
  );

  return {
    t: tWithParams,
    locale,
    hasKey,
  };
}

/**
 * 格式化数字
 */
export function useNumber() {
  const locale = useLocale();

  const format = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale, options).format(value);
    },
    [locale],
  );

  const formatCurrency = useCallback(
    (value: number, currency: string = 'USD') => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(value);
    },
    [locale],
  );

  const formatPercent = useCallback(
    (value: number) => {
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    },
    [locale],
  );

  return { format, formatCurrency, formatPercent };
}

/**
 * 格式化日期
 */
export function useDateFormat() {
  const locale = useLocale();

  const format = useCallback(
    (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
      const date = value instanceof Date ? value : new Date(value);
      return new Intl.DateTimeFormat(locale, options).format(date);
    },
    [locale],
  );

  const formatShort = useCallback(
    (value: Date | string | number) => {
      return format(value, { dateStyle: 'short' });
    },
    [format],
  );

  const formatLong = useCallback(
    (value: Date | string | number) => {
      return format(value, { dateStyle: 'long' });
    },
    [format],
  );

  const formatTime = useCallback(
    (value: Date | string | number) => {
      return format(value, { timeStyle: 'short' });
    },
    [format],
  );

  const formatDateTime = useCallback(
    (value: Date | string | number) => {
      return format(value, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    },
    [format],
  );

  const formatRelative = useCallback(
    (value: Date | string | number) => {
      const date = value instanceof Date ? value : new Date(value);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);

      if (diffSec < 60) {
        return '刚刚';
      } else if (diffMin < 60) {
        return `${diffMin} 分钟前`;
      } else if (diffHour < 24) {
        return `${diffHour} 小时前`;
      } else if (diffDay < 7) {
        return `${diffDay} 天前`;
      } else {
        return format(value, { dateStyle: 'medium' });
      }
    },
    [format],
  );

  return {
    format,
    formatShort,
    formatLong,
    formatTime,
    formatDateTime,
    formatRelative,
  };
}
