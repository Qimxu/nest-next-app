'use client';

import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/lib/i18n/LanguageSwitcher';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <Image
                  src="/static/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
                <span className="text-xl font-bold text-gray-900">
                  {t('common.appName')}
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/users"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                {t('nav.users')}
              </Link>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Hero 区域 */}
          <div className="text-center mb-12">
            <Image
              src="/static/logo.png"
              alt="Logo"
              width={80}
              height={80}
              className="mx-auto mb-6"
              priority
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t('home.welcome')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.subtitle') || 'A modern full-stack application'}
            </p>
          </div>

          {/* 功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900">
                    {t('home.userManagement')}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  {t('home.userManagementDesc')}
                </p>
                <div className="mt-4">
                  <Link
                    href="/users"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {t('home.viewUsers')} &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Image
                src="/static/logo.png"
                alt="Logo"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              <span className="text-sm text-gray-500">
                © {new Date().getFullYear()} Nest Next App. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
