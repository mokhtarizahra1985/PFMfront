import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  budgetsApi,
  type CreateBudgetInput,
  type UpdateBudgetInput,
} from '@/api/budgets.api';

export const BUDGETS_QUERY_KEY = 'budgets';

export function budgetsQueryKey(year: number, month: number) {
  return [BUDGETS_QUERY_KEY, year, month] as const;
}

export function useBudgets(year: number, month: number) {
  return useQuery({
    queryKey: budgetsQueryKey(year, month),
    queryFn: () => budgetsApi.list(year, month),
  });
}

function invalidateBudgetQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: [BUDGETS_QUERY_KEY] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useBudgetMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateBudgetInput) => budgetsApi.create(input),
    onSuccess: () => invalidateBudgetQueries(queryClient),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBudgetInput }) =>
      budgetsApi.update(id, input),
    onSuccess: () => invalidateBudgetQueries(queryClient),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => invalidateBudgetQueries(queryClient),
  });

  return { createMutation, updateMutation, deleteMutation };
}
