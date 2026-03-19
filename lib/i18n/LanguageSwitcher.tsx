'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  locales,
  localeNames,
  type Locale,
  isValidLocale,
} from '@/i18n.config';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleChange = (newLocale: Locale) => {
    // 替换 URL 中的语言前缀
    const segments = pathname.split('/');
    if (segments.length > 1 && isValidLocale(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleChange(locale)}
          className={`
            px-3 py-1.5 text-sm font-medium rounded-md transition-colors
            ${
              currentLocale === locale
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}
