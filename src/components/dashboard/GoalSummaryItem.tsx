import { Link } from 'react-router-dom';
import type { DashboardGoalSummary } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { formatDisplayDate } from '@/utils/date';

interface GoalSummaryItemProps {
  goal: DashboardGoalSummary;
}

export function GoalSummaryItem({ goal }: GoalSummaryItemProps) {
  const progress = Math.min(goal.percentage, 100);

  return (
    <div className="space-y-2 border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/app/goals/${goal.id}`}
          className="text-sm font-medium text-slate-900 hover:text-primary-700"
        >
          {goal.title}
        </Link>
        <span className="text-xs font-medium text-primary-600">{goal.percentage}٪</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={goal.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${goal.title}: ${goal.percentage} درصد پیشرفت`}
      >
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          پس‌انداز: <MoneyText amount={goal.savedAmount} />
        </span>
        <span>
          هدف: <MoneyText amount={goal.targetAmount} />
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-xs text-slate-400">
          مهلت: {formatDisplayDate(goal.targetDate)}
        </p>
        <Link
          to={`/app/goals/${goal.id}?action=contribute`}
          className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
        >
          ثبت واریز
        </Link>
      </div>
    </div>
  );
}
