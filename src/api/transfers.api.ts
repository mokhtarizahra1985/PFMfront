import { apiClient } from './client';
import type {
  ApiResponse,
  MessageResponse,
  PaginatedResponse,
  Transfer,
} from '@/types/api.types';

export interface CreateTransferInput {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  transferDate: string;
  note?: string;
}

export interface UpdateTransferInput {
  amount?: number;
  transferDate?: string;
  note?: string;
}

export interface TransferListParams {
  page?: number;
  limit?: number;
}

export const transfersApi = {
  list: async (
    params: TransferListParams = {},
  ): Promise<PaginatedResponse<Transfer>> => {
    const { data } = await apiClient.get<PaginatedResponse<Transfer>>(
      '/transfers',
      { params },
    );
    return data;
  },

  getById: async (id: string): Promise<Transfer> => {
    const { data } = await apiClient.get<ApiResponse<Transfer>>(`/transfers/${id}`);
    return data.data;
  },

  create: async (input: CreateTransferInput): Promise<Transfer> => {
    const { data } = await apiClient.post<ApiResponse<Transfer>>('/transfers', input);
    return data.data;
  },

  update: async (id: string, input: UpdateTransferInput): Promise<Transfer> => {
    const { data } = await apiClient.patch<ApiResponse<Transfer>>(
      `/transfers/${id}`,
      input,
    );
    return data.data;
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(
      `/transfers/${id}`,
    );
    return data.data;
  },
};
