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

  private getToken(): string | null {
    let token = tokenManager.getToken();
    if (!token && typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const { state } = JSON.parse(authStorage);
          token = state?.token || null;
          if (token) tokenManager.setToken(token);
        }
      } catch {}
    }
    return token;
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
    } = {},
  ): Promise<T> {
    const { method = 'GET', body, params, timeout, signal, headers } = config;
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
