'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { authApi } from '@/services/auth';
import { tokenManager } from '@/lib/request';
import { User } from '@/services/users';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user;

  // 客户端挂载时，从 access_token cookie（非 httpOnly）恢复 token 到内存
  // SSR 已经获取了完整用户数据，这里只需同步 token 供后续 API 调用使用
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    if (token) {
      tokenManager.setToken(token);
    } else {
      // cookie 不存在（已登出或过期），清理用户状态
      setUser(null);
    }
  }, []); // eslint-disable-line

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ email, password });
      tokenManager.setToken(response.access_token);
      tokenManager.setRefreshToken(response.refresh_token);

      const userData = await authApi.me();
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch {
      // Token 可能已过期，忽略错误继续清理
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
