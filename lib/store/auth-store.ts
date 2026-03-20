import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { tokenManager } from '@/lib/request';
import { authApi, LoginParams } from '@/services/auth';
import { User } from '@/services/users';

/**
 * 认证状态
 */
interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // 操作
  login: (params: LoginParams) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

/**
 * 认证状态管理
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // 登录
      login: async (params: LoginParams) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(params);
          const { access_token, refresh_token } = response;

          // 同步到 tokenManager
          tokenManager.setToken(access_token);
          tokenManager.setRefreshToken(refresh_token);

          // 获取用户信息
          const user = await authApi.me();

          set({
            token: access_token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      // 登出
      logout: async () => {
        set({ isLoading: true });
        try {
          await authApi.logout();
        } catch (error) {
          // 即使 API 调用失败，也清除本地状态
          console.error('Logout error:', error);
        } finally {
          // 清除 tokenManager 中的 token
          tokenManager.clearTokens();

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // 获取当前用户
      fetchUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          // 获取用户失败，清除认证状态
          tokenManager.clearTokens();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // 设置 Token
      setToken: (token: string | null) => {
        // 同步到 tokenManager
        tokenManager.setToken(token);
        set({ token, isAuthenticated: !!token });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      // 从 localStorage 恢复时同步到 tokenManager 并获取用户信息
      onRehydrateStorage: () => {
        return (state) => {
          if (state?.token) {
            tokenManager.setToken(state.token);
            // 页面刷新后自动获取用户信息
            if (!state.user) {
              useAuthStore.getState().fetchUser();
            }
          }
        };
      },
    },
  ),
);
