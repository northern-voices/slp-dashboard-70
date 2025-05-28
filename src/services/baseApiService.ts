
import { ApiError } from './api';

export interface ApiRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

export class BaseApiService {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  protected async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = { ...this.defaultHeaders, ...config?.headers };

    const requestConfig: RequestInit = {
      method,
      headers,
      signal: config?.timeout ? AbortSignal.timeout(config.timeout) : undefined,
    };

    if (data && method !== 'GET') {
      requestConfig.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, requestConfig);
      
      if (!response.ok) {
        throw new ApiError(
          `API Error: ${response.statusText}`,
          response.status,
          response.statusText
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0,
        'Network Error'
      );
    }
  }

  protected async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, config);
  }

  protected async post<T>(endpoint: string, data: unknown, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'POST', data, config);
  }

  protected async put<T>(endpoint: string, data: unknown, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'PUT', data, config);
  }

  protected async delete(endpoint: string, config?: ApiRequestConfig): Promise<void> {
    await this.request(endpoint, 'DELETE', undefined, config);
  }
}
