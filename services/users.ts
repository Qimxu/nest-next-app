import { http, PaginationParams, PaginatedData } from '@/lib/request';

export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserParams {
  name: string;
  email: string;
  password: string;
}

export const usersApi = {
  getList: (params?: PaginationParams) =>
    http.get<PaginatedData<User>>('/users', params as Record<string, string | number>),
  getOne: (id: number) => http.get<User>(`/users/${id}`),
  getProfile: () => http.get<User>('/users/profile'),
  create: (data: CreateUserParams) => http.post<User>('/users', data),
  update: (id: number, data: Partial<CreateUserParams>) => http.patch<User>(`/users/${id}`, data),
  delete: (id: number) => http.delete<void>(`/users/${id}`),
};
