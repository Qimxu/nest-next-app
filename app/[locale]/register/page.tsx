'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { Navbar } from '@/lib/components/Navbar';

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { login } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.passwordMinLength', { min: 8 }));
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({ name, email, password });
      await login({ email, password });
      router.push(`/${locale}`);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : t('auth.registerFailed');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0b14] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0b14] via-[#110d1c] to-[#0d0b14]" />
        <div className="absolute inset-0 bg-cyber-grid opacity-40" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#a855f7]/12 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#818cf8]/8 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="font-['Orbitron'] text-3xl font-bold text-white mb-2">
              <span className="text-[#38bdf8]">&lt;</span>
              {t('auth.signUpTitle')}
              <span className="text-[#38bdf8]">/&gt;</span>
            </h1>
            <p className="text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link
                href={`/${locale}/login`}
                className="text-[#7dd3fc] hover:text-[#38bdf8] transition-colors hover:underline"
              >
                {t('auth.signIn')}
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <div className="card-cyber p-8 rounded-2xl animate-fade-in-up delay-100">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-[#a855f7]/10 border border-[#a855f7]/30 text-[#c4b5fd] px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="name" className="label-cyber">
                  {t('auth.fullName')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-cyber"
                  placeholder="John Doe"
                />
              </div>

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

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="label-cyber">
                  {t('auth.password')}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-cyber"
                  placeholder="••••••••"
                />
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="label-cyber">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-cyber"
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-cyber w-full justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                ) : (
                  <>
                    {t('auth.signUp')}
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
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center animate-fade-in-up delay-200">
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
      </div>
    </div>
  );
}
