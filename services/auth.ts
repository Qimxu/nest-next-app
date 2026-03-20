import { http } from '@/lib/request';
import { User } from './users';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export interface ForgotPasswordParams {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  token: string;
}

export interface ResetPasswordParams {
  token: string;
  newPassword: string;
}

export interface VerifyResetTokenParams {
  token: string;
}

export const authApi = {
  login: (data: LoginParams) => http.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterParams) =>
    http.post<LoginResponse>('/auth/register', data),
  logout: () => http.post<void>('/auth/logout'),
  me: () => http.get<User>('/users/profile'),
  refreshToken: (refreshToken: string) =>
    http.post<{ access_token: string }>('/auth/refresh', { refreshToken }),

  // 忘记密码
  forgotPassword: (data: ForgotPasswordParams) =>
    http.post<ForgotPasswordResponse>('/auth/forgot-password', data),
  verifyResetToken: (data: VerifyResetTokenParams) =>
    http.post<{ message: string; email: string }>(
      '/auth/verify-reset-token',
      data,
    ),
  resetPassword: (data: ResetPasswordParams) =>
    http.post<{ message: string }>('/auth/reset-password', data),
};
