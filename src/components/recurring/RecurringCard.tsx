import type { RecurringTransaction } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { formatDisplayDate } from '@/utils/date';
import { getFrequencyLabel } from '@/utils/recurring-labels';

interface RecurringCardProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onToggleActive: (item: RecurringTransaction) => void;
  onDelete: (item: RecurringTransaction) => void;
}

export function RecurringCard({
  item,
  onEdit,
  onToggleActive,
  onDelete,
}: RecurringCardProps) {
  return (
    <article
      className={[
        'surface-card p-5',
        item.isActive ? '' : 'opacity-75',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            {!item.isActive ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                متوقف
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {item.categoryIcon} {item.categoryName} · {item.accountName}
          </p>
        </div>
        <p
          className={[
            'text-lg font-bold',
            item.type === 'INCOME' ? 'text-green-700' : 'text-red-700',
          ].join(' ')}
        >
          <MoneyText amount={item.amount} />
        </p>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-500">دوره</dt>
          <dd className="font-medium text-slate-900">{getFrequencyLabel(item.frequency)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">سررسید بعدی</dt>
          <dd className="font-medium text-slate-900">{formatDisplayDate(item.nextRunDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">شروع</dt>
          <dd className="text-slate-700">{formatDisplayDate(item.startDate)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">پایان</dt>
          <dd className="text-slate-700">
            {item.endDate ? formatDisplayDate(item.endDate) : 'نامحدود'}
          </dd>
        </div>
      </dl>

      {item.note ? <p className="mt-3 text-xs text-slate-500">{item.note}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-xl border border-slate-200/70 px-3 py-1.5 text-sm hover:bg-surface"
        >
          ویرایش
        </button>
        <button
          type="button"
          onClick={() => onToggleActive(item)}
          className="rounded-xl border border-slate-200/70 px-3 py-1.5 text-sm hover:bg-surface"
        >
          {item.isActive ? 'توقف' : 'فعال‌سازی'}
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="rounded-xl px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
        >
          حذف
        </button>
      </div>
    </article>
  );
}
