import { apiClient } from './client';
import type {
  ApiResponse,
  Goal,
  GoalContribution,
  GoalProgress,
  GoalStatus,
  MessageResponse,
} from '@/types/api.types';

export interface CreateGoalInput {
  title: string;
  category: string;
  targetAmount: number;
  targetDate?: string;
  note?: string;
}

export interface UpdateGoalInput {
  title?: string;
  targetAmount?: number;
  targetDate?: string;
  note?: string;
  status?: GoalStatus;
}

export interface CreateContributionInput {
  amount: number;
  contributionDate: string;
  note?: string;
}

export interface UpdateContributionInput {
  amount?: number;
  contributionDate?: string;
  note?: string;
}

export const goalsApi = {
  list: async (status?: GoalStatus): Promise<Goal[]> => {
    const { data } = await apiClient.get<ApiResponse<Goal[]>>('/goals', {
      params: status ? { status } : undefined,
    });
    return (data.data ?? []).map(normalizeGoal);
  },

  getById: async (id: string): Promise<Goal> => {
    const { data } = await apiClient.get<ApiResponse<Goal>>(`/goals/${id}`);
    return normalizeGoal(data.data);
  },

  create: async (input: CreateGoalInput): Promise<Goal> => {
    const { data } = await apiClient.post<ApiResponse<Goal>>('/goals', input);
    return normalizeGoal(data.data);
  },

  update: async (id: string, input: UpdateGoalInput): Promise<Goal> => {
    const { data } = await apiClient.patch<ApiResponse<Goal>>(`/goals/${id}`, input);
    return normalizeGoal(data.data);
  },

  delete: async (id: string): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(`/goals/${id}`);
    return data.data;
  },

  getProgress: async (id: string): Promise<GoalProgress> => {
    const { data } = await apiClient.get<ApiResponse<GoalProgress>>(`/goals/${id}/progress`);
    return normalizeProgress(data.data);
  },

  getContributions: async (goalId: string): Promise<GoalContribution[]> => {
    const { data } = await apiClient.get<ApiResponse<GoalContribution[]>>(
      `/goals/${goalId}/contributions`,
    );
    return (data.data ?? []).map(normalizeContribution);
  },

  addContribution: async (
    goalId: string,
    input: CreateContributionInput,
  ): Promise<GoalContribution> => {
    const { data } = await apiClient.post<ApiResponse<GoalContribution>>(
      `/goals/${goalId}/contributions`,
      input,
    );
    return normalizeContribution(data.data);
  },

  updateContribution: async (
    goalId: string,
    contributionId: string,
    input: UpdateContributionInput,
  ): Promise<GoalContribution> => {
    const { data } = await apiClient.patch<ApiResponse<GoalContribution>>(
      `/goals/${goalId}/contributions/${contributionId}`,
      input,
    );
    return normalizeContribution(data.data);
  },

  deleteContribution: async (
    goalId: string,
    contributionId: string,
  ): Promise<MessageResponse> => {
    const { data } = await apiClient.delete<ApiResponse<MessageResponse>>(
      `/goals/${goalId}/contributions/${contributionId}`,
    );
    return data.data;
  },
};

function normalizeGoal(goal: Goal): Goal {
  return {
    ...goal,
    targetAmount: Number(goal.targetAmount) || 0,
    savedAmount: Number(goal.savedAmount) || 0,
    remainingAmount: Number(goal.remainingAmount) || 0,
    percentage: Number(goal.percentage) || 0,
    targetDate: goal.targetDate ?? null,
    note: goal.note ?? null,
  };
}

function normalizeProgress(progress: GoalProgress): GoalProgress {
  return {
    ...progress,
    targetAmount: Number(progress.targetAmount) || 0,
    savedAmount: Number(progress.savedAmount) || 0,
    remainingAmount: Number(progress.remainingAmount) || 0,
    percentage: Number(progress.percentage) || 0,
  };
}

function normalizeContribution(contribution: GoalContribution): GoalContribution {
  return {
    ...contribution,
    amount: Number(contribution.amount) || 0,
    note: contribution.note ?? null,
  };
}
