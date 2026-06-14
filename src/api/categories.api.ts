import { apiClient } from './client';
import type {
  ApiResponse,
  Category,
  CategoryType,
  MessageResponse,
} from '@/types/api.types';

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  icon?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  icon?: string;
}

export const categoriesApi = {
  list: async (type?: CategoryType): Promise<Category[]> => {
    const { data } = await apiClient.get<ApiResponse<Category[]>>('/categories', {
      params: type ? { type } : undefined,
    });
    return data.data;
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
    return data.data;
  },

  create: async (input: CreateCategoryInput): Promise<Category> => {
    const { data } = await apiClient.post<ApiResponse<Category>>('/categories', input);
    return data.data;
  },

  update: async (id: string, input: UpdateCategoryInput): Promise<Category> => {
    const { data } = await apiClient.patch<ApiResponse<Category>>(
      `/categories/${id}`,
      input,
    );
    return data.data;
  },

  deactivate: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(
      `/categories/${id}`,
    );
    return data.data;
  },
};
