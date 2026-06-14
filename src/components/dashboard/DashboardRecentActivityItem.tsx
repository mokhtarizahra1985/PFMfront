import type { DashboardRecentActivity } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { formatDisplayDate } from '@/utils/date';

interface DashboardRecentActivityItemProps {
  activity: DashboardRecentActivity;
}

export function DashboardRecentActivityItem({
  activity,
}: DashboardRecentActivityItemProps) {
  if (activity.kind === 'TRANSFER') {
    return (
      <article className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
        <div className="flex gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base"
            aria-label="انتقال"
          >
            ↔
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900">{activity.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {activity.sourceName} ← {activity.destName}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatDisplayDate(activity.date)}
            </p>
          </div>
        </div>
        <p className="text-sm font-semibold text-slate-700">
          <MoneyText amount={activity.amount} />
        </p>
      </article>
    );
  }

  const prefix = activity.type === 'INCOME' ? '+' : '-';
  const amountClass = activity.type === 'INCOME' ? 'text-green-700' : 'text-red-700';

  return (
    <article className="flex items-start justify-between gap-3 border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-base"
          aria-label={activity.type === 'INCOME' ? 'درآمد' : 'هزینه'}
        >
          {activity.categoryIcon || (activity.type === 'INCOME' ? '💰' : '💸')}
        </span>
        <div>
          <p className="text-sm font-medium text-slate-900">{activity.title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{activity.categoryName}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatDisplayDate(activity.date)}
          </p>
        </div>
      </div>
      <p className={`text-sm font-semibold ${amountClass}`}>
        <span aria-hidden="true">{prefix} </span>
        <MoneyText amount={activity.amount} />
      </p>
    </article>
  );
}
