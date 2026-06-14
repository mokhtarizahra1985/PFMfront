import type { DashboardBudgetSummary } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { getBudgetStatusConfig } from '@/utils/budget-status';

interface BudgetSummaryItemProps {
  budget: DashboardBudgetSummary;
}

export function BudgetSummaryItem({ budget }: BudgetSummaryItemProps) {
  const config = getBudgetStatusConfig(budget.status);
  const progress = Math.min(budget.percentage, 100);

  return (
    <div className="space-y-2 border-b border-slate-100 py-3 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">{budget.categoryName}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}
        >
          {config.label}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={budget.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${budget.categoryName}: ${budget.percentage} درصد مصرف`}
      >
        <div
          className={`h-full rounded-full transition-all ${config.barClass}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          مصرف: <MoneyText amount={budget.spentAmount} />
        </span>
        <span>
          سقف: <MoneyText amount={budget.limitAmount} />
        </span>
      </div>
    </div>
  );
}
