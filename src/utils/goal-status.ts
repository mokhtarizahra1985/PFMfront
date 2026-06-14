import type { GoalStatus } from '@/types/api.types';

export const GOAL_STATUS_CONFIG = {
  ACTIVE: {
    label: 'فعال',
    badgeClass: 'bg-green-50 text-green-700',
  },
  COMPLETED: {
    label: 'تکمیل‌شده',
    badgeClass: 'bg-primary-50 text-primary-700',
  },
  PAUSED: {
    label: 'متوقف‌شده',
    badgeClass: 'bg-amber-50 text-amber-700',
  },
  CANCELLED: {
    label: 'لغوشده',
    badgeClass: 'bg-slate-100 text-slate-600',
  },
} as const satisfies Record<GoalStatus, { label: string; badgeClass: string }>;

export function getGoalStatusConfig(status: GoalStatus) {
  return GOAL_STATUS_CONFIG[status];
}
