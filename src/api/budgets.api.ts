import { apiClient } from './client';
import type { ApiResponse, Budget, MessageResponse } from '@/types/api.types';

export interface CreateBudgetInput {
  categoryId: string;
  year: number;
  month: number;
  limitAmount: number;
}

export interface UpdateBudgetInput {
  limitAmount: number;
}

export const budgetsApi = {
  list: async (year: number, month: number): Promise<Budget[]> => {
    const { data } = await apiClient.get<ApiResponse<Budget[]>>('/budgets', {
      params: { year, month },
    });
    return (data.data ?? []).map(normalizeBudget);
  },

  getById: async (id: string): Promise<Budget> => {
    const { data } = await apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`);
    return normalizeBudget(data.data);
  },

  create: async (input: CreateBudgetInput): Promise<Budget> => {
    const { data } = await apiClient.post<ApiResponse<Budget>>('/budgets', input);
    return normalizeBudget(data.data);
  },

  update: async (id: string, input: UpdateBudgetInput): Promise<Budget> => {
    const { data } = await apiClient.patch<ApiResponse<Budget>>(`/budgets/${id}`, input);
    return normalizeBudget(data.data);
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(`/budgets/${id}`);
    return data.data;
  },
};

function normalizeBudget(budget: Budget): Budget {
  return {
    ...budget,
    limitAmount: Number(budget.limitAmount) || 0,
    spentAmount: Number(budget.spentAmount) || 0,
    remainingAmount: Number(budget.remainingAmount) || 0,
    exceededAmount: Number(budget.exceededAmount) || 0,
    percentage: Number(budget.percentage) || 0,
  };
}
