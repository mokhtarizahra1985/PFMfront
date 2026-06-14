import { apiClient } from './client';
import type {
  ApiResponse,
  MessageResponse,
  RecurringTransaction,
  TransactionType,
  RecurringFrequency,
} from '@/types/api.types';

export interface CreateRecurringInput {
  title: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate?: string;
  note?: string;
}

export interface UpdateRecurringInput {
  title?: string;
  amount?: number;
  accountId?: string;
  categoryId?: string;
  frequency?: RecurringFrequency;
  startDate?: string;
  endDate?: string | null;
  note?: string | null;
  isActive?: boolean;
}

export const recurringApi = {
  list: async (type?: TransactionType): Promise<RecurringTransaction[]> => {
    const { data } = await apiClient.get<ApiResponse<RecurringTransaction[]>>(
      '/recurring-transactions',
      { params: type ? { type } : undefined },
    );
    return (data.data ?? []).map(normalizeRecurring);
  },

  create: async (input: CreateRecurringInput): Promise<RecurringTransaction> => {
    const { data } = await apiClient.post<ApiResponse<RecurringTransaction>>(
      '/recurring-transactions',
      input,
    );
    return normalizeRecurring(data.data);
  },

  update: async (
    id: string,
    input: UpdateRecurringInput,
  ): Promise<RecurringTransaction> => {
    const { data } = await apiClient.patch<ApiResponse<RecurringTransaction>>(
      `/recurring-transactions/${id}`,
      input,
    );
    return normalizeRecurring(data.data);
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(
      `/recurring-transactions/${id}`,
    );
    return data.data;
  },

  processDue: async (): Promise<{ createdCount: number }> => {
    const { data } = await apiClient.post<ApiResponse<{ createdCount: number }>>(
      '/recurring-transactions/process-due',
    );
    return data.data;
  },
};

function normalizeRecurring(item: RecurringTransaction): RecurringTransaction {
  return {
    ...item,
    amount: Number(item.amount) || 0,
    isActive: Boolean(item.isActive),
  };
}
