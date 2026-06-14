import { apiClient } from './client';
import type {
  ApiResponse,
  MessageResponse,
  PaginatedResponse,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '@/types/api.types';

export interface CreateTransactionInput {
  type: TransactionType;
  title: string;
  amount: number;
  accountId: string;
  categoryId: string;
  transactionDate: string;
  note?: string;
}

export interface UpdateTransactionInput {
  title?: string;
  amount?: number;
  accountId?: string;
  categoryId?: string;
  transactionDate?: string;
  note?: string;
}

export const transactionsApi = {
  list: async (
    filters: TransactionFilters = {},
  ): Promise<PaginatedResponse<Transaction>> => {
    const { data } = await apiClient.get<PaginatedResponse<Transaction>>(
      '/transactions',
      { params: filters },
    );
    return data;
  },

  getById: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.get<ApiResponse<Transaction>>(
      `/transactions/${id}`,
    );
    return data.data;
  },

  create: async (input: CreateTransactionInput): Promise<Transaction> => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>(
      '/transactions',
      input,
    );
    return data.data;
  },

  update: async (
    id: string,
    input: UpdateTransactionInput,
  ): Promise<Transaction> => {
    const { data } = await apiClient.patch<ApiResponse<Transaction>>(
      `/transactions/${id}`,
      input,
    );
    return data.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(
      `/transactions/${id}`,
    );
    return data.data;
  },

  restore: async (id: string): Promise<Transaction> => {
    const { data } = await apiClient.post<ApiResponse<Transaction>>(
      `/transactions/${id}/restore`,
    );
    return data.data;
  },
};
