import type { ActivityItem } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { formatDisplayDate } from '@/utils/date';
import { Link } from 'react-router-dom';

interface ActivityListItemProps {
  item: ActivityItem;
  onDelete: (item: ActivityItem) => void;
}

export function ActivityListItem({ item, onDelete }: ActivityListItemProps) {
  if (item.kind === 'TRANSFER') {
    const transfer = item.data;
    return (
      <article className="surface-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg"
              aria-label="انتقال"
            >
              ↔
            </span>
            <div>
              <p className="font-semibold text-slate-900">انتقال وجه</p>
              <p className="mt-1 text-sm text-slate-500">
                {transfer.sourceAccountName} ← {transfer.destinationAccountName}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {formatDisplayDate(transfer.transferDate)}
                {transfer.note ? ' · یادداشت دارد' : ''}
              </p>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-700">
              <MoneyText amount={transfer.amount} />
            </p>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="mt-2 text-xs text-red-600 hover:underline"
            >
              حذف
            </button>
          </div>
        </div>
      </article>
    );
  }

  const transaction = item.data;
  const prefix = transaction.type === 'INCOME' ? '+' : '-';
  const indicatorLabel = transaction.type === 'INCOME' ? 'درآمد' : 'هزینه';
  const amountClass =
    transaction.type === 'INCOME' ? 'text-green-700' : 'text-red-700';

  return (
    <article className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg"
            aria-label={indicatorLabel}
          >
            {transaction.categoryIcon || (transaction.type === 'INCOME' ? '💰' : '💸')}
          </span>
          <div>
            <p className="font-semibold text-slate-900">{transaction.title}</p>
            <p className="mt-1 text-sm text-slate-500">
              {transaction.categoryName} · {transaction.accountName}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {formatDisplayDate(transaction.transactionDate)}
              {transaction.note ? ' · یادداشت دارد' : ''}
            </p>
          </div>
        </div>
        <div className="text-left">
          <p className={`text-sm font-semibold ${amountClass}`}>
            <span aria-hidden="true">{prefix} </span>
            <MoneyText amount={transaction.amount} />
          </p>
          <div className="mt-2 flex gap-2">
            <Link
              to={`/app/transactions/${transaction.id}/edit`}
              className="text-xs text-primary-600 hover:underline"
            >
              ویرایش
            </Link>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="text-xs text-red-600 hover:underline"
            >
              حذف
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
