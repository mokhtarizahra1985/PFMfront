import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  transactionsApi,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from '@/api/transactions.api';
import { transfersApi } from '@/api/transfers.api';
import type {
  ActivityItem,
  ActivityType,
  TransactionFilters,
} from '@/types/api.types';
import {
  toTransactionFilters,
  type ActivityListFilters,
} from '@/utils/transaction-filters';

export const TRANSACTIONS_QUERY_KEY = 'transactions';

export function transactionsQueryKey(filters: TransactionFilters) {
  return [TRANSACTIONS_QUERY_KEY, filters] as const;
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionsQueryKey(filters),
    queryFn: () => transactionsApi.list(filters),
  });
}

export function useTransaction(id: string | undefined) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getById(id!),
    enabled: Boolean(id),
  });
}

function mergeActivities(
  transactions: ActivityItem[],
  transfers: ActivityItem[],
  sortBy: TransactionFilters['sortBy'] = 'transactionDate',
  sortOrder: TransactionFilters['sortOrder'] = 'desc',
): ActivityItem[] {
  const merged = [...transactions, ...transfers];

  merged.sort((a, b) => {
    let aValue: string | number = '';
    let bValue: string | number = '';

    if (sortBy === 'amount') {
      aValue = a.data.amount;
      bValue = b.data.amount;
    } else if (sortBy === 'createdAt') {
      aValue = a.data.createdAt;
      bValue = b.data.createdAt;
    } else {
      aValue =
        a.kind === 'TRANSACTION'
          ? a.data.transactionDate
          : a.data.transferDate;
      bValue =
        b.kind === 'TRANSACTION'
          ? b.data.transactionDate
          : b.data.transferDate;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return merged;
}

function filterTransfersClientSide(
  transfers: ActivityItem[],
  filters: TransactionFilters,
): ActivityItem[] {
  return transfers.filter((item) => {
    if (item.kind !== 'TRANSFER') return false;
    const transfer = item.data;

    if (filters.accountId) {
      const matchesAccount =
        transfer.sourceAccountId === filters.accountId ||
        transfer.destinationAccountId === filters.accountId;
      if (!matchesAccount) return false;
    }

    if (filters.dateFrom && transfer.transferDate < filters.dateFrom) return false;
    if (filters.dateTo && transfer.transferDate > filters.dateTo) return false;
    if (filters.minAmount && transfer.amount < filters.minAmount) return false;
    if (filters.maxAmount && transfer.amount > filters.maxAmount) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = [
        'انتقال وجه',
        transfer.note ?? '',
        transfer.sourceAccountName ?? '',
        transfer.destinationAccountName ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function useActivityList(
  activityType: ActivityType,
  filters: ActivityListFilters,
) {
  const baseFilters = toTransactionFilters(filters);
  const page = baseFilters.page ?? 1;
  const limit = baseFilters.limit ?? 20;
  const isTransferOnly = activityType === 'TRANSFER';
  const isTransactionOnly =
    activityType === 'INCOME' || activityType === 'EXPENSE';
  const isAll = activityType === 'ALL';

  const transactionFilters: TransactionFilters = {
    ...baseFilters,
    page: isAll ? 1 : page,
    limit: isAll ? page * limit : limit,
    type: isTransactionOnly ? activityType : isAll ? undefined : baseFilters.type,
  };

  const txQuery = useQuery({
    queryKey: [TRANSACTIONS_QUERY_KEY, activityType, transactionFilters],
    queryFn: () => transactionsApi.list(transactionFilters),
    enabled: !isTransferOnly,
  });

  const transferFetchLimit = isAll ? page * limit : limit;
  const transferPage = isAll ? 1 : page;

  const transferQuery = useQuery({
    queryKey: ['transfers', { page: transferPage, limit: transferFetchLimit, activityType, filters: baseFilters }],
    queryFn: () =>
      transfersApi.list({ page: transferPage, limit: transferFetchLimit }),
    enabled: isTransferOnly || isAll,
  });

  if (isTransferOnly) {
    const transferItems: ActivityItem[] =
      transferQuery.data?.data.map((data) => ({ kind: 'TRANSFER', data })) ?? [];

    return {
      items: filterTransfersClientSide(transferItems, filters),
      meta: transferQuery.data?.meta,
      isLoading: transferQuery.isLoading,
      isError: transferQuery.isError,
      refetch: transferQuery.refetch,
    };
  }

  if (isTransactionOnly || activityType === 'ALL') {
    const transactionItems: ActivityItem[] =
      txQuery.data?.data.map((data) => ({ kind: 'TRANSACTION', data })) ?? [];

    if (activityType === 'ALL') {
      const transferItems: ActivityItem[] =
        transferQuery.data?.data.map((data) => ({ kind: 'TRANSFER', data })) ?? [];

      const filteredTransfers = filterTransfersClientSide(transferItems, filters);
      const merged = mergeActivities(
        transactionItems,
        filteredTransfers,
        filters.sortBy,
        filters.sortOrder,
      );
      const start = (page - 1) * limit;
      const pageItems = merged.slice(start, start + limit);
      const total =
        (txQuery.data?.meta.total ?? 0) + (transferQuery.data?.meta.total ?? 0);

      return {
        items: pageItems,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
        isLoading: txQuery.isLoading || transferQuery.isLoading,
        isError: txQuery.isError || transferQuery.isError,
        refetch: async () => {
          await Promise.all([txQuery.refetch(), transferQuery.refetch()]);
        },
      };
    }

    return {
      items: transactionItems,
      meta: txQuery.data?.meta,
      isLoading: txQuery.isLoading,
      isError: txQuery.isError,
      refetch: txQuery.refetch,
    };
  }

  return {
    items: [],
    meta: undefined,
    isLoading: false,
    isError: false,
    refetch: async () => undefined,
  };
}

export function invalidateFinancialQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: [TRANSACTIONS_QUERY_KEY] });
  void queryClient.invalidateQueries({ queryKey: ['transfers'] });
  void queryClient.invalidateQueries({ queryKey: ['accounts'] });
  void queryClient.invalidateQueries({ queryKey: ['balances'] });
  void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  void queryClient.invalidateQueries({ queryKey: ['budgets'] });
  void queryClient.invalidateQueries({ queryKey: ['monthly-report'] });
  void queryClient.invalidateQueries({ queryKey: ['expenses-report'] });
  void queryClient.invalidateQueries({ queryKey: ['comparison-report'] });
  void queryClient.invalidateQueries({ queryKey: ['goals'] });
  void queryClient.invalidateQueries({ queryKey: ['goal'] });
  void queryClient.invalidateQueries({ queryKey: ['goal-progress'] });
  void queryClient.invalidateQueries({ queryKey: ['goal-contributions'] });
  void queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
}

export function useTransactionMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionsApi.create(input),
    onSuccess: () => invalidateFinancialQueries(queryClient),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      transactionsApi.update(id, input),
    onSuccess: () => invalidateFinancialQueries(queryClient),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => invalidateFinancialQueries(queryClient),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.restore(id),
    onSuccess: () => invalidateFinancialQueries(queryClient),
  });

  return { createMutation, updateMutation, deleteMutation, restoreMutation };
}

export function useTransferMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: transfersApi.create,
    onSuccess: () => invalidateFinancialQueries(queryClient),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof transfersApi.update>[1] }) =>
      transfersApi.update(id, input),
    onSuccess: () => invalidateFinancialQueries(queryClient),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transfersApi.delete(id),
    onSuccess: () => invalidateFinancialQueries(queryClient),
  });

  return { createMutation, updateMutation, deleteMutation };
}
