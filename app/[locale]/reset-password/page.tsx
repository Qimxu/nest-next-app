'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi } from '@/services/auth';

type PageState = 'verifying' | 'form' | 'submitting' | 'success' | 'error';

function ResetPasswordContent() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [pageState, setPageState] = useState<PageState>('verifying');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // 验证 token
  useEffect(() => {
    if (!token) {
      setPageState('error');
      setError(t('errors.invalidToken'));
      return;
    }

    const verifyToken = async () => {
      try {
        const result = await authApi.verifyResetToken({ token });
        setUserEmail(result.email);
        setPageState('form');
      } catch (err: any) {
        setPageState('error');
        setError(err.message || t('errors.invalidToken'));
      }
    };

    verifyToken();
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(t('errors.invalidToken'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      setError(t('auth.passwordMinLength', { min: 8 }));
      return;
    }

    setPageState('submitting');

    try {
      await authApi.resetPassword({ token, newPassword });
      // 重置成功，自动跳转到登录页
      router.push(`/${locale}/login`);
      return;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('errors.generic');
      setError(errorMessage);
      setPageState('form');
    }
  };

  // 验证中状态
  if (pageState === 'verifying') {
    return (
      <div className="min-h-screen bg-[#0d0b14] relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#110d1c] to-[#0d0b14]" />
          <div className="absolute inset-0 bg-cyber-grid opacity-40" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 mb-6">
              <svg
                className="animate-spin h-8 w-8 text-[#38bdf8]"
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
            </div>
            <h1 className="font-['Orbitron'] text-xl font-bold text-white mb-2">
              {t('common.loading')}
            </h1>
            <p className="text-gray-400">{t('auth.verifyingToken')}</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-[#0d0b14] relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#110d1c] to-[#0d0b14]" />
          <div className="absolute inset-0 bg-cyber-grid opacity-40" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#a855f7]/10 border border-[#a855f7]/25 mb-6">
              <svg
                className="w-8 h-8 text-[#a855f7]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>

            <h1 className="font-['Orbitron'] text-2xl font-bold text-white mb-4">
              <span className="text-[#a855f7]">&lt;</span>
              {t('errors.invalidToken')}
              <span className="text-[#a855f7]">/&gt;</span>
            </h1>

            <p className="text-gray-400 mb-8">{error}</p>

            <div className="flex flex-col gap-3">
              <Link
                href={`/${locale}/forgot-password`}
                className="btn-cyber w-full justify-center"
              >
                {t('auth.resendEmail')}
              </Link>
              <Link
                href={`/${locale}/login`}
                className="btn-cyber-outline w-full justify-center"
              >
                {t('auth.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 成功状态
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-[#0d0b14] relative overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#110d1c] to-[#0d0b14]" />
          <div className="absolute inset-0 bg-cyber-grid opacity-40" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
          <div className="w-full max-w-md text-center">
            <div className="relative inline-flex items-center justify-center mb-8">
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
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            <h1 className="font-['Orbitron'] text-2xl font-bold text-white mb-4">
              <span className="text-[#38bdf8]">&lt;</span>
              {t('auth.resetSuccess')}
              <span className="text-[#38bdf8]">/&gt;</span>
            </h1>

            <p className="text-gray-400 mb-8">{t('auth.resetSuccessDesc')}</p>

            <Link
              href={`/${locale}/login`}
              className="btn-cyber w-full justify-center"
            >
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 表单状态
  return (
    <div className="min-h-screen bg-[#0d0b14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#110d1c] to-[#0d0b14]" />
        <div className="absolute inset-0 bg-cyber-grid opacity-40" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#a855f7]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
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
              {t('auth.resetPasswordTitle')}
              <span className="text-[#38bdf8]">/&gt;</span>
            </h1>
            <p className="text-gray-400 text-sm">
              {t('auth.resetPasswordDesc', { email: userEmail })}
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

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="label-cyber">
                  {t('auth.newPassword')}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-cyber pr-10"
                    placeholder="••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#c4b5fd] transition-colors focus:outline-none"
                    tabIndex={-1}
                    aria-label={showNewPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showNewPassword ? (
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
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
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
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {t('auth.passwordMinLength', { min: 8 })}
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="label-cyber">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-cyber pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#c4b5fd] transition-colors focus:outline-none"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showConfirmPassword ? (
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
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
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
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={pageState === 'submitting'}
                className="btn-cyber w-full justify-center"
              >
                {pageState === 'submitting' ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    <span>{t('common.loading')}</span>
                  </>
                ) : (
                  <>
                    {t('auth.resetPassword')}
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
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
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
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0d0b14] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 mb-6">
              <svg
                className="animate-spin h-8 w-8 text-[#38bdf8]"
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
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
