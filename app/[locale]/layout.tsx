import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales, isValidLocale } from '@/i18n.config';
import { getServerFullUser } from '@/lib/auth/server';
import { AuthProvider } from '@/lib/auth/context';
import { Navbar } from '@/lib/components/Navbar';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getMessages(locale: string) {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    notFound();
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) {
    notFound();
  }

  // 并行获取 messages 和完整用户信息，减少 SSR 等待时间
  const [messages, initialUser] = await Promise.all([
    getMessages(locale),
    getServerFullUser(), // 直接获取真实 name，首屏无闪烁
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider initialUser={initialUser ?? null}>
        <Navbar />
        {children}
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
