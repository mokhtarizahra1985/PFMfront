import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  accountsApi,
  type CreateAccountInput,
  type UpdateAccountInput,
} from '@/api/accounts.api';

export const ACCOUNTS_QUERY_KEY = ['accounts'] as const;

export function useAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEY,
    queryFn: accountsApi.list,
  });
}

export function useActiveAccounts() {
  const query = useAccounts();
  const data = useMemo(
    () => query.data?.filter((account) => account.isActive === true),
    [query.data],
  );

  return {
    ...query,
    data,
  };
}

export function useAccountMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ['balances'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: CreateAccountInput) => accountsApi.create(input),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAccountInput }) =>
      accountsApi.update(id, input),
    onSuccess: invalidate,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => accountsApi.deactivate(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deactivateMutation };
}
