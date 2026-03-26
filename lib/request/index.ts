/**
 * 请求层 - HTTP 客户端和 Token 管理
 */

// ============ 配置 ============
export const API_CONFIG = {
  baseURL: typeof window !== 'undefined' ? '' : 'http://localhost:3000',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
};

// ============ 类型 ============
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

export interface PaginatedData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export class ApiError extends Error {
  code: number;
  data: any;
  constructor(message: string, code: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

// ============ Token 管理 ============
class TokenManager {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private listeners: Set<(token: string | null) => void> = new Set();

  setToken(token: string | null) {
    this.token = token;
    this.listeners.forEach((l) => l(token));
  }
  getToken(): string | null {
    return this.token;
  }
  setRefreshToken(token: string | null) {
    this.refreshToken = token;
  }
  getRefreshToken(): string | null {
    return this.refreshToken;
  }
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    this.listeners.forEach((l) => l(null));
  }
  subscribe(listener: (token: string | null) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const tokenManager = new TokenManager();
export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
  tokenManager.setToken(accessToken);
  if (refreshToken) tokenManager.setRefreshToken(refreshToken);
};
export const clearAuthTokens = () => tokenManager.clearTokens();
export const isAuthenticated = () => !!tokenManager.getToken();

// ============ HTTP 客户端 ============
class HttpClient {
  private baseURL = API_CONFIG.baseURL;
  private defaultHeaders = API_CONFIG.headers;
  private defaultTimeout = API_CONFIG.timeout;

  // Token 刷新互斥锁：多个并发 401 请求共享同一次刷新，避免竞争
  private refreshPromise: Promise<string | null> | null = null;

  private getToken(): string | null {
    return tokenManager.getToken();
  }

  /** 调用 /auth/refresh（无需 body，httpOnly cookie 自动携带）*/
  private tryRefreshToken(): Promise<string | null> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = fetch(this.buildURL('/auth/refresh'), {
      method: 'POST',
      headers: this.defaultHeaders,
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const json = await res.json();
        const newToken: string | null = json?.data?.access_token ?? null;
        if (newToken) tokenManager.setToken(newToken);
        return newToken;
      })
      .catch(() => null)
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private buildURL(
    url: string,
    params?: Record<string, string | number>,
  ): string {
    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.append(k, String(v));
      });
      const qs = searchParams.toString();
      return qs ? `${fullURL}?${qs}` : fullURL;
    }
    return fullURL;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data: ApiResponse<T> = await response.json();
    if (response.status === 401) {
      tokenManager.clearTokens();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('auth:logout', {
            detail: { reason: 'token_expired' },
          }),
        );
      }
      // 保留后端返回的错误码 (INVALID_CREDENTIALS, ACCOUNT_DISABLED 等)
      const error = new ApiError(
        data.message || 'Unauthorized',
        401,
        data.data,
      );
      (error as any).code = data.data;
      throw error;
    }
    if (!response.ok) {
      const error = new ApiError(
        data.message || `HTTP ${response.status}`,
        response.status,
        data.data,
      );
      (error as any).code = data.data;
      throw error;
    }
    if (data.code >= 400) {
      const error = new ApiError(data.message, data.code, data.data);
      (error as any).code = data.data;
      throw error;
    }
    return data;
  }

  async request<T>(
    url: string,
    config: {
      method?: string;
      body?: any;
      params?: Record<string, string | number>;
      timeout?: number;
      signal?: AbortSignal;
      headers?: Record<string, string>;
      _isRetry?: boolean; // 内部标志，防止无限刷新循环
    } = {},
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      params,
      timeout,
      signal,
      headers,
      _isRetry = false,
    } = config;
    const token = this.getToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      timeout || this.defaultTimeout,
    );

    try {
      const response = await fetch(this.buildURL(url, params), {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
        credentials: 'include',
        cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'default',
      });
      clearTimeout(timeoutId);

      // 首次 401：尝试无感刷新 Token，成功则自动重试原请求
      if (
        response.status === 401 &&
        !_isRetry &&
        typeof window !== 'undefined' &&
        !url.includes('/auth/refresh') // 刷新本身失败不再递归
      ) {
        const newToken = await this.tryRefreshToken();
        if (newToken) {
          return this.request<T>(url, { ...config, _isRetry: true });
        }
        // 刷新失败，交由 handleResponse 派发 auth:logout
      }

      return (await this.handleResponse<T>(response)).data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) throw error;
      if ((error as Error).name === 'AbortError')
        throw new ApiError('Request aborted', 0);
      throw new ApiError((error as Error).message || 'Network error', 0);
    }
  }

  get<T>(url: string, params?: Record<string, string | number>) {
    return this.request<T>(url, { method: 'GET', params });
  }
  post<T>(url: string, body?: any) {
    return this.request<T>(url, { method: 'POST', body });
  }
  put<T>(url: string, body?: any) {
    return this.request<T>(url, { method: 'PUT', body });
  }
  patch<T>(url: string, body?: any) {
    return this.request<T>(url, { method: 'PATCH', body });
  }
  delete<T>(url: string) {
    return this.request<T>(url, { method: 'DELETE' });
  }
}

export const http = new HttpClient();
