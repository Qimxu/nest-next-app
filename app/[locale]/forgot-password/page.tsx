'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { authApi } from '@/services/auth';

type PageState = 'form' | 'success';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageState, setPageState] = useState<PageState>('form');
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authApi.forgotPassword({ email });
      // 根据当前 locale 构建完整的重置密码 URL
      if (result.token) {
        const fullResetUrl = `${baseUrl}/${locale}/reset-password?token=${result.token}`;
        setResetUrl(fullResetUrl);
      }
      setPageState('success');
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('auth.resetEmailFailed');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0b14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#0d1120] to-[#0d0b14]" />
        <div className="absolute inset-0 bg-cyber-grid opacity-40" />
        {/* Blue orb — top left */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl" />
        {/* Purple orb — bottom right */}
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-md">
          {pageState === 'form' ? (
            <>
              {/* Header */}
              <div className="text-center mb-8 animate-fade-in-up">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 mb-6">
                  <svg
                    className="w-8 h-8 text-[#38bdf8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>

                <h1 className="font-['Orbitron'] text-3xl font-bold text-white mb-2">
                  <span className="text-[#38bdf8]">&lt;</span>
                  {t('auth.forgotPasswordTitle')}
                  <span className="text-[#38bdf8]">/&gt;</span>
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {t('auth.forgotPasswordDesc')}
                </p>
              </div>

              {/* Form Card */}
              <div className="card-cyber p-8 rounded-2xl animate-fade-in-up delay-100">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Error Message */}
                  {error && (
                    <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#c4b5fd] px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="label-cyber">
                      {t('auth.email')}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-cyber"
                      placeholder="name@example.com"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-cyber w-full justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>{t('auth.sending')}</span>
                      </>
                    ) : (
                      <>
                        {t('auth.sendResetLink')}
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
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Back to Login */}
              <div className="mt-8 text-center animate-fade-in-up delay-200">
                <Link
                  href={`/${locale}/login`}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#7dd3fc] transition-colors"
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
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                  {t('auth.backToLogin')}
                </Link>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center animate-fade-in-up">
              {/* Success Icon */}
              <div className="relative inline-flex items-center justify-center mb-8">
                {/* Glow ring */}
                <div className="absolute w-24 h-24 rounded-full bg-[#38bdf8]/15 blur-xl" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a855f7]/20 to-[#38bdf8]/20 border border-[#38bdf8]/30 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-[#38bdf8]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-['Orbitron'] text-3xl font-bold text-white mb-3">
                <span className="text-[#38bdf8]">&lt;</span>
                {t('auth.resetLinkSent')}
                <span className="text-[#38bdf8]">/&gt;</span>
              </h1>

              {/* Description Card */}
              <div className="card-cyber p-6 rounded-2xl mb-8 text-left">
                <p className="text-gray-300 leading-relaxed text-sm">
                  {t('auth.resetLinkSentDesc', { email })}
                </p>

                {/* Reset Link */}
                {resetUrl && (
                  <div className="mt-4 p-4 bg-[#38bdf8]/10 border border-[#38bdf8]/30 rounded-xl">
                    <p className="text-xs text-[#7dd3fc] mb-2">
                      点击以下链接重置密码：
                    </p>
                    <a
                      href={resetUrl}
                      className="text-sm text-[#38bdf8] hover:text-[#7dd3fc] break-all underline underline-offset-2 transition-colors"
                    >
                      {resetUrl}
                    </a>
                    <button
                      onClick={() => navigator.clipboard.writeText(resetUrl)}
                      className="mt-3 w-full py-2 px-4 bg-[#38bdf8]/20 hover:bg-[#38bdf8]/30 text-[#38bdf8] text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
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
                          d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5"
                        />
                      </svg>
                      复制链接
                    </button>
                  </div>
                )}

                {/* Steps hint */}
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  {[
                    { num: '01', text: t('auth.resetStep1') },
                    { num: '02', text: t('auth.resetStep2') },
                    { num: '03', text: t('auth.resetStep3') },
                  ].map((step) => (
                    <div key={step.num} className="flex items-center gap-3">
                      <span className="font-['Orbitron'] text-xs text-[#38bdf8]/50 w-6 flex-shrink-0">
                        {step.num}
                      </span>
                      <span className="text-sm text-gray-400">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  href={`/${locale}/login`}
                  className="btn-cyber w-full justify-center"
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
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  {t('auth.backToLogin')}
                </Link>

                <button
                  onClick={() => {
                    setPageState('form');
                    setError('');
                  }}
                  className="btn-cyber-outline w-full justify-center"
                >
                  {t('auth.resendEmail')}
                </button>
              </div>

              {/* Back to home */}
              <div className="mt-8">
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#c4b5fd] transition-colors"
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
                      d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    />
                  </svg>
                  {t('auth.backToHome')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
