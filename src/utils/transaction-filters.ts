import type { ActivityType, TransactionFilters } from '@/types/api.types';

export interface ActivityListFilters extends TransactionFilters {
  activityType?: ActivityType;
}

export function parseActivityFilters(
  params: URLSearchParams,
): ActivityListFilters {
  const activityType = (params.get('activityType') as ActivityType) || 'ALL';
  const sortBy = params.get('sortBy') as TransactionFilters['sortBy'];
  const sortOrder = params.get('sortOrder') as TransactionFilters['sortOrder'];

  return {
    activityType,
    page: Number(params.get('page') || 1),
    limit: Number(params.get('limit') || 20),
    search: params.get('search') || undefined,
    type: (params.get('type') as TransactionFilters['type']) || undefined,
    categoryId: params.get('categoryId') || undefined,
    accountId: params.get('accountId') || undefined,
    dateFrom: params.get('dateFrom') || undefined,
    dateTo: params.get('dateTo') || undefined,
    minAmount: params.get('minAmount')
      ? Number(params.get('minAmount'))
      : undefined,
    maxAmount: params.get('maxAmount')
      ? Number(params.get('maxAmount'))
      : undefined,
    sortBy: sortBy || 'transactionDate',
    sortOrder: sortOrder || 'desc',
  };
}

export function buildActivitySearchParams(
  filters: ActivityListFilters,
): URLSearchParams {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === '' || value === null) return;
    if (key === 'activityType' && value === 'ALL') return;
    params.set(key, String(value));
  });

  return params;
}

export function toTransactionFilters(filters: ActivityListFilters): TransactionFilters {
  return {
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    type: filters.type,
    categoryId: filters.categoryId,
    accountId: filters.accountId,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    minAmount: filters.minAmount,
    maxAmount: filters.maxAmount,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
}
