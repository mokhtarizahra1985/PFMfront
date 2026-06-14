import { apiClient } from './client';
import type {
  Account,
  AccountType,
  ApiResponse,
  MessageResponse,
} from '@/types/api.types';

export interface CreateAccountInput {
  name: string;
  type: AccountType;
  initialBalance?: number;
}

export interface UpdateAccountInput {
  name?: string;
  type?: AccountType;
}

export const accountsApi = {
  list: async (): Promise<Account[]> => {
    const { data } = await apiClient.get<ApiResponse<Account[]>>('/accounts');
    return (data.data ?? []).map(normalizeAccount);
  },

  getById: async (id: string): Promise<Account> => {
    const { data } = await apiClient.get<ApiResponse<Account>>(`/accounts/${id}`);
    return normalizeAccount(data.data);
  },

  create: async (input: CreateAccountInput): Promise<Account> => {
    const { data } = await apiClient.post<ApiResponse<Account>>('/accounts', input);
    return normalizeAccount(data.data);
  },

  update: async (id: string, input: UpdateAccountInput): Promise<Account> => {
    const { data } = await apiClient.patch<ApiResponse<Account>>(
      `/accounts/${id}`,
      input,
    );
    return normalizeAccount(data.data);
  },

  deactivate: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(
      `/accounts/${id}`,
    );
    return data.data;
  },
};

function normalizeAccount(account: Account): Account {
  const rawActive = account.isActive as boolean | number;
  return {
    ...account,
    isActive: rawActive === true || rawActive === 1,
    balance: Number(account.balance) || 0,
    initialBalance: Number(account.initialBalance) || 0,
  };
}
