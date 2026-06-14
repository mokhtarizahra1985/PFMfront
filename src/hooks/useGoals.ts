import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  goalsApi,
  type CreateContributionInput,
  type CreateGoalInput,
  type UpdateContributionInput,
  type UpdateGoalInput,
} from '@/api/goals.api';
import type { GoalStatus } from '@/types/api.types';

export const GOALS_QUERY_KEY = 'goals';

export function goalsQueryKey(status?: GoalStatus | 'all') {
  return [GOALS_QUERY_KEY, status ?? 'all'] as const;
}

export function useGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: goalsQueryKey(status ?? 'all'),
    queryFn: () => goalsApi.list(status),
  });
}

export function useGoal(id: string | undefined) {
  return useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalsApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useGoalProgress(id: string | undefined) {
  return useQuery({
    queryKey: ['goal-progress', id],
    queryFn: () => goalsApi.getProgress(id!),
    enabled: Boolean(id),
  });
}

export function useGoalContributions(id: string | undefined) {
  return useQuery({
    queryKey: ['goal-contributions', id],
    queryFn: () => goalsApi.getContributions(id!),
    enabled: Boolean(id),
  });
}

function invalidateGoalQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  goalId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: [GOALS_QUERY_KEY] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  if (goalId) {
    void queryClient.invalidateQueries({ queryKey: ['goal', goalId] });
    void queryClient.invalidateQueries({ queryKey: ['goal-progress', goalId] });
    void queryClient.invalidateQueries({ queryKey: ['goal-contributions', goalId] });
  }
}

export function useGoalMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => goalsApi.create(input),
    onSuccess: () => invalidateGoalQueries(queryClient),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateGoalInput }) =>
      goalsApi.update(id, input),
    onSuccess: (_, { id }) => invalidateGoalQueries(queryClient, id),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () => invalidateGoalQueries(queryClient),
  });

  return { createMutation, updateMutation, deleteMutation };
}

export function useContributionMutations(goalId: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateContributionInput) =>
      goalsApi.addContribution(goalId, input),
    onSuccess: () => invalidateGoalQueries(queryClient, goalId),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      contributionId,
      input,
    }: {
      contributionId: string;
      input: UpdateContributionInput;
    }) => goalsApi.updateContribution(goalId, contributionId, input),
    onSuccess: () => invalidateGoalQueries(queryClient, goalId),
  });

  const deleteMutation = useMutation({
    mutationFn: (contributionId: string) =>
      goalsApi.deleteContribution(goalId, contributionId),
    onSuccess: () => invalidateGoalQueries(queryClient, goalId),
  });

  return { createMutation, updateMutation, deleteMutation };
}
