import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  recurringApi,
  type CreateRecurringInput,
  type UpdateRecurringInput,
} from '@/api/recurring.api';
import type { TransactionType } from '@/types/api.types';
import { invalidateFinancialQueries } from '@/hooks/useTransactions';

export const RECURRING_QUERY_KEY = 'recurring-transactions';

export function recurringQueryKey(type?: TransactionType) {
  return type ? [RECURRING_QUERY_KEY, type] as const : [RECURRING_QUERY_KEY] as const;
}

export function useRecurring(type?: TransactionType) {
  return useQuery({
    queryKey: recurringQueryKey(type),
    queryFn: () => recurringApi.list(type),
  });
}

function invalidateRecurringQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: [RECURRING_QUERY_KEY] });
  invalidateFinancialQueries(queryClient);
}

export function useRecurringMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateRecurringInput) => recurringApi.create(input),
    onSuccess: () => invalidateRecurringQueries(queryClient),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRecurringInput }) =>
      recurringApi.update(id, input),
    onSuccess: () => invalidateRecurringQueries(queryClient),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recurringApi.delete(id),
    onSuccess: () => invalidateRecurringQueries(queryClient),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      recurringApi.update(id, { isActive }),
    onSuccess: () => invalidateRecurringQueries(queryClient),
  });

  return { createMutation, updateMutation, deleteMutation, toggleActiveMutation };
}
