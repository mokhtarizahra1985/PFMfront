import type { BudgetStatus } from '@/types/api.types';

export const BUDGET_STATUS_CONFIG = {
  SAFE: {
    label: 'ایمن',
    barClass: 'bg-green-500',
    badgeClass: 'bg-green-50 text-green-700',
  },
  WARNING: {
    label: 'نزدیک سقف',
    barClass: 'bg-warning',
    badgeClass: 'bg-amber-50 text-amber-700',
  },
  EXCEEDED: {
    label: 'عبور از سقف',
    barClass: 'bg-danger',
    badgeClass: 'bg-red-50 text-red-700',
  },
} as const satisfies Record<
  BudgetStatus,
  { label: string; barClass: string; badgeClass: string }
>;

export function getBudgetStatusConfig(status: BudgetStatus) {
  return BUDGET_STATUS_CONFIG[status];
}
