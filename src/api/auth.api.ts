import { apiClient } from './client';
import type { ApiResponse, AuthPayload, User } from '@/types/api.types';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: async (input: RegisterInput): Promise<AuthPayload> => {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>(
      '/auth/register',
      input,
    );
    return data.data;
  },

  login: async (input: LoginInput): Promise<AuthPayload> => {
    const { data } = await apiClient.post<ApiResponse<AuthPayload>>(
      '/auth/login',
      input,
    );
    return data.data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
};
