'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import {
  locales,
  localeNames,
  type Locale,
  isValidLocale,
} from '@/i18n.config';

export function Navbar() {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const currentLocale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsUserOpen(false);
    router.push(`/${currentLocale}`);
  };

  const handleLocaleChange = (newLocale: Locale) => {
    const segments = pathname.split('/');
    if (segments.length > 1 && isValidLocale(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join('/'));
    setIsLangOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b14]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href={`/${currentLocale}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a855f7]/20 to-[#38bdf8]/20 border border-[#a855f7]/30 flex items-center justify-center group-hover:border-[#a855f7]/60 transition-all duration-300">
            <Image
              src="/static/logo.png"
              alt="Logo"
              width={24}
              height={24}
              className="transition-all duration-300 group-hover:scale-110"
              priority
            />
          </div>
          <span className="font-['Orbitron'] font-bold text-lg tracking-wider">
            <span className="text-[#a855f7]">NEST</span>
            <span className="text-[#38bdf8]">NEXT</span>
          </span>
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Language Dropdown */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors bg-white/5 border border-white/10 hover:border-[#a855f7]/40 rounded-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
              <span className="font-medium">
                {localeNames[currentLocale as Locale]}
              </span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Language Dropdown Menu */}
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-[#0d0b14] border border-white/10 rounded-lg overflow-hidden shadow-xl shadow-black/50 animate-fade-in-up">
                {locales.map((locale) => (
                  <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                      currentLocale === locale
                        ? 'text-[#c4b5fd] bg-[#a855f7]/10'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{localeNames[locale]}</span>
                    {currentLocale === locale && (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User / Login */}
          {isAuthenticated && user ? (
            <div ref={userRef} className="relative">
              <button
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors bg-white/5 border border-white/10 hover:border-[#a855f7]/40 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#a855f7] to-[#38bdf8] flex items-center justify-center text-white font-medium text-xs">
                  {user.name?.charAt(0).toUpperCase() ||
                    user.email?.charAt(0).toUpperCase() ||
                    'U'}
                </div>
                <span className="font-medium max-w-[100px] truncate hidden sm:block">
                  {user.name || user.email}
                </span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${isUserOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {isUserOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0d0b14] border border-white/10 rounded-lg overflow-hidden shadow-xl shadow-black/50 animate-fade-in-up">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-medium text-white truncate">
                      {user.name || user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={`/${currentLocale}/login`}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[#38bdf8]/40 rounded-lg transition-all hover:bg-white/10 text-sm text-gray-300 hover:text-white"
            >
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
