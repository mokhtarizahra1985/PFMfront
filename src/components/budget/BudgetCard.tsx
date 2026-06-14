import type { Budget } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { getBudgetStatusConfig } from '@/utils/budget-status';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const config = getBudgetStatusConfig(budget.status);
  const progress = Math.min(budget.percentage, 100);

  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg"
            aria-hidden="true"
          >
            {budget.categoryIcon || '📁'}
          </span>
          <div>
            <p className="font-semibold text-slate-900">{budget.categoryName}</p>
            <p className="mt-1 text-xs text-slate-500">{budget.percentage}٪ مصرف شده</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${config.badgeClass}`}
        >
          {config.label}
        </span>
      </div>

      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
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

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">سقف بودجه</dt>
          <dd className="mt-0.5 font-medium text-slate-900">
            <MoneyText amount={budget.limitAmount} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">مصرف‌شده</dt>
          <dd className="mt-0.5 font-medium text-slate-900">
            <MoneyText amount={budget.spentAmount} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">باقی‌مانده</dt>
          <dd className="mt-0.5 font-medium text-green-700">
            <MoneyText amount={budget.remainingAmount} />
          </dd>
        </div>
        {budget.exceededAmount > 0 ? (
          <div>
            <dt className="text-xs text-slate-500">عبور از سقف</dt>
            <dd className="mt-0.5 font-medium text-red-700">
              <MoneyText amount={budget.exceededAmount} />
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onEdit(budget)}
          className="rounded-lg px-3 py-1.5 text-xs text-primary-600 hover:bg-primary-50"
        >
          ویرایش سقف
        </button>
        <button
          type="button"
          onClick={() => onDelete(budget)}
          className="rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
        >
          حذف
        </button>
      </div>
    </article>
  );
}
