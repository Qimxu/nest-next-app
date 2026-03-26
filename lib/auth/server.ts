import { cookies } from 'next/headers';
import { decodeJwt } from 'jose';
import type { User } from '@/services/users';
import type { UserRole } from '@/services/users';

export interface ServerUser {
  id: number;
  email: string;
  role: string;
  token: string;
}

/**
 * 从 Cookie 解码 JWT，返回基础用户信息 + 原始 token
 */
export async function getServerUser(): Promise<ServerUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) return null;

    const payload = decodeJwt(accessToken);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    if (!payload.sub || !payload.email) return null;

    return {
      id: parseInt(payload.sub as string, 10),
      email: payload.email as string,
      role: (payload.role as string) || 'user',
      token: accessToken,
    };
  } catch {
    return null;
  }
}

/**
 * SSR 阶段获取完整用户信息（含真实 name），避免客户端二次请求导致界面闪烁。
 * NestJS 与 Next.js 同进程，localhost 调用延迟极低。
 */
export async function getServerFullUser(): Promise<User | null> {
  const serverUser = await getServerUser();
  if (!serverUser) return null;

  try {
    const apiBase =
      process.env.INTERNAL_API_URL ||
      process.env.API_BASE_URL ||
      'http://localhost:3000';

    const res = await fetch(`${apiBase}/users/profile`, {
      headers: {
        Authorization: `Bearer ${serverUser.token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return null;

    // NestJS TransformInterceptor 包装格式：{ code, data, message, ... }
    const json = await res.json();
    const user = json.data as User;
    if (!user) return null;

    return {
      ...user,
      role: user.role as string as UserRole,
    };
  } catch {
    return null;
  }
}
