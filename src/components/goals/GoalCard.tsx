import { Link } from 'react-router-dom';
import type { Goal } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { formatDisplayDate } from '@/utils/date';
import { getGoalStatusConfig } from '@/utils/goal-status';

interface GoalCardProps {
  goal: Goal;
}

export function GoalCard({ goal }: GoalCardProps) {
  const statusConfig = getGoalStatusConfig(goal.status);
  const progress = Math.min(goal.percentage, 100);
  const canContribute = goal.status === 'ACTIVE';

  return (
    <article className="surface-card flex h-full flex-col p-5">
      <Link
        to={`/app/goals/${goal.id}`}
        className="block flex-1 transition hover:opacity-90"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-900">{goal.title}</p>
            <p className="mt-1 text-sm text-slate-500">{goal.category}</p>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig.badgeClass}`}
          >
            {statusConfig.label}
          </span>
        </div>

        <div
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
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

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">پس‌انداز</p>
            <p className="text-sm font-semibold text-slate-900">
              <MoneyText amount={goal.savedAmount} />
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-500">هدف</p>
            <p className="text-sm font-semibold text-slate-900">
              <MoneyText amount={goal.targetAmount} />
            </p>
          </div>
          <div className="text-left">
            <p className="text-xs text-primary-600">{goal.percentage}٪</p>
          </div>
        </div>

        {goal.targetDate ? (
          <p className="mt-3 text-xs text-slate-400">
            مهلت: {formatDisplayDate(goal.targetDate)}
          </p>
        ) : null}
      </Link>

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        {canContribute ? (
          <Link
            to={`/app/goals/${goal.id}?action=contribute`}
            className="flex-1 rounded-xl bg-primary-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary-700"
          >
            ثبت واریز
          </Link>
        ) : null}
        <Link
          to={`/app/goals/${goal.id}`}
          className={[
            'rounded-xl border border-slate-200/70 px-3 py-2 text-center text-sm text-slate-700 hover:bg-surface',
            canContribute ? 'flex-1' : 'w-full',
          ].join(' ')}
        >
          جزئیات
        </Link>
      </div>
    </article>
  );
}
