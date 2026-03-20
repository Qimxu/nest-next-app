'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import NotFoundAnimations from '../not-found-animations';

export default function LocaleNotFound() {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('notFound');
  const locale = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0b14] text-white">
      <NotFoundAnimations />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-2xl mx-auto">
          {/* Glitch 404 */}
          <div className="mb-6 relative">
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 -ml-1 text-[6rem] md:text-[10rem] font-black leading-none tracking-tighter text-[#a855f7]/70 opacity-50 animate-glitch-1 select-none font-['Orbitron']"
              aria-hidden="true"
            >
              404
            </span>
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 ml-1 text-[6rem] md:text-[10rem] font-black leading-none tracking-tighter text-[#38bdf8]/70 opacity-50 animate-glitch-2 select-none font-['Orbitron']"
              aria-hidden="true"
            >
              404
            </span>
            <h1 className="relative text-[6rem] md:text-[10rem] font-black leading-none tracking-tighter bg-gradient-to-b from-white via-gray-300 to-gray-600 bg-clip-text text-transparent select-none font-['Orbitron']">
              404
            </h1>
          </div>

          {/* Error Badge */}
          <div
            className={`inline-flex items-center px-4 py-2 bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#c4b5fd] text-sm font-medium mb-6 font-['Orbitron'] rounded-lg transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="w-2 h-2 bg-[#a855f7] rounded-full mr-2 animate-pulse shadow-[0_0_10px_#a855f7]" />
            {t('badge').toUpperCase()}
          </div>

          {/* Title */}
          <h2
            className={`text-3xl md:text-4xl font-bold mb-4 font-['Orbitron'] transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <span className="text-[#a855f7]">&lt;</span>
            {t('title')}
            <span className="text-[#38bdf8]">/&gt;</span>
          </h2>

          {/* Description */}
          <p
            className={`text-gray-400 text-lg mb-10 max-w-md mx-auto leading-relaxed transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {t('description')}
          </p>

          {/* Action Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Link href={`/${locale}`} className="btn-cyber">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
              {t('returnHome')}
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn-cyber-outline"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              {t('goBack')}
            </button>
          </div>

          {/* Tech Details */}
          <div
            className={`mt-16 pt-8 border-t border-white/5 transition-all duration-500 delay-400 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600 font-mono">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#a855f7]/50 rounded-full" />
                STATUS: 404
              </span>
              <span className="text-gray-700">|</span>
              <span>ERROR: NOT_FOUND</span>
              <span className="text-gray-700">|</span>
              <span>NAMESPACE: VOID</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
