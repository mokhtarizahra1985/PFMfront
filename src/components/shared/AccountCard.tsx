import type { Account } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { getAccountTypeLabel } from '@/utils/account-types';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDeactivate: (account: Account) => void;
}

export function AccountCard({ account, onEdit, onDeactivate }: AccountCardProps) {
  return (
    <article
      className={[
        'surface-card p-5',
        account.isActive ? 'border-slate-200' : 'border-slate-200 opacity-75',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{account.name}</h3>
            {!account.isActive ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                غیرفعال
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {getAccountTypeLabel(account.type)}
          </p>
        </div>
        <div className="text-left">
          <p className="text-xs text-slate-500">موجودی</p>
          <p className="text-lg font-bold text-slate-900">
            <MoneyText amount={account.balance} />
          </p>
        </div>
      </div>

      {account.isActive ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ویرایش
          </button>
          <button
            type="button"
            onClick={() => onDeactivate(account)}
            className="rounded-xl border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
          >
            غیرفعال‌سازی
          </button>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(account)}
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            ویرایش
          </button>
          <p className="self-center text-xs text-slate-500">
            این حساب غیرفعال است و در تراکنش‌های جدید قابل انتخاب نیست.
          </p>
        </div>
      )}
    </article>
  );
}
