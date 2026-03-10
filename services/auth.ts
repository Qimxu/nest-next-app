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

export const authApi = {
  login: (data: LoginParams) => http.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterParams) => http.post<LoginResponse>('/auth/register', data),
  logout: () => http.post<void>('/auth/logout'),
  me: () => http.get<User>('/users/profile'),
  refreshToken: (refreshToken: string) =>
    http.post<{ access_token: string }>('/auth/refresh', { refreshToken }),
};
