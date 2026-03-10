'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * 认证 Hook
 */
export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    fetchUser,
    clearError,
  } = useAuthStore();
  const router = useRouter();

  // 自动获取用户信息
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  // 登录并跳转
  const loginAndRedirect = async (
    email: string,
    password: string,
    redirectTo: string = '/web',
  ) => {
    try {
      await login({ email, password });
      router.push(redirectTo);
    } catch (error) {
      throw error;
    }
  };

  // 登出并跳转
  const logoutAndRedirect = async (redirectTo: string = '/web/login') => {
    await logout();
    router.push(redirectTo);
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    loginAndRedirect,
    logoutAndRedirect,
    fetchUser,
    clearError,
  };
}

/**
 * 路由守卫 Hook
 * 未认证时自动跳转到登录页
 */
export function useRequireAuth(redirectTo: string = '/web/login') {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading, user };
}

/**
 * 已认证用户跳转 Hook
 * 已认证时自动跳转到指定页面
 */
export function useRedirectIfAuthenticated(
  redirectTo: string = '/web/dashboard',
) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}
