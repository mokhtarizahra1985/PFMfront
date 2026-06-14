import axios, { type AxiosError } from 'axios';
import type { ApiErrorBody } from '@/types/api.types';

const TOKEN_KEY = 'pfm_access_token';

export const getStoredToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export class ApiClientError extends Error {
  code: string;
  fields?: Record<string, string>;

  constructor(code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.fields = fields;
  }
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void): void => {
  unauthorizedHandler = handler;
};

export const normalizeApiError = (error: unknown): ApiClientError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const payload = axiosError.response?.data?.error;

    if (payload) {
      return new ApiClientError(payload.code, payload.message, payload.fields);
    }

    if (axiosError.response?.status === 401) {
      return new ApiClientError('UNAUTHORIZED', 'لطفاً دوباره وارد شوید.');
    }

    return new ApiClientError(
      'NETWORK_ERROR',
      'خطا در ارتباط با سرور. دوباره تلاش کنید.',
    );
  }

  return new ApiClientError('UNKNOWN_ERROR', 'خطای ناشناخته رخ داد.');
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredToken();
      unauthorizedHandler?.();
    }
    return Promise.reject(normalizeApiError(error));
  },
);
