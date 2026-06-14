import type { ActivityListFilters } from '@/utils/transaction-filters';
import type { ActivityType } from '@/types/api.types';
import { useActiveAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { JalaliDateInput } from '@/components/shared/JalaliDateInput';
import { formatDisplayDate } from '@/utils/date';

interface TransactionFiltersPanelProps {
  filters: ActivityListFilters;
  onChange: (next: ActivityListFilters) => void;
  onClear: () => void;
}

const ACTIVITY_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'ALL', label: 'همه' },
  { value: 'EXPENSE', label: 'هزینه' },
  { value: 'INCOME', label: 'درآمد' },
  { value: 'TRANSFER', label: 'انتقال' },
];

const SORT_OPTIONS = [
  { value: 'transactionDate:desc', label: 'جدیدترین' },
  { value: 'transactionDate:asc', label: 'قدیمی‌ترین' },
  { value: 'amount:desc', label: 'بیشترین مبلغ' },
  { value: 'amount:asc', label: 'کمترین مبلغ' },
];

export function TransactionFiltersPanel({
  filters,
  onChange,
  onClear,
}: TransactionFiltersPanelProps) {
  const { data: accounts } = useActiveAccounts();
  const { data: expenseCategories } = useCategories('EXPENSE');
  const { data: incomeCategories } = useCategories('INCOME');

  const categories =
    filters.activityType === 'INCOME'
      ? incomeCategories
      : filters.activityType === 'EXPENSE'
        ? expenseCategories
        : [...(expenseCategories ?? []), ...(incomeCategories ?? [])];

  const sortValue = `${filters.sortBy ?? 'transactionDate'}:${filters.sortOrder ?? 'desc'}`;

  const activeChips = [
    filters.activityType && filters.activityType !== 'ALL'
      ? ACTIVITY_OPTIONS.find((o) => o.value === filters.activityType)?.label
      : null,
    filters.accountId
      ? accounts?.find((a) => a.id === filters.accountId)?.name
      : null,
    filters.categoryId
      ? categories?.find((c) => c.id === filters.categoryId)?.name
      : null,
    filters.dateFrom ? `از ${formatDisplayDate(filters.dateFrom)}` : null,
    filters.dateTo ? `تا ${formatDisplayDate(filters.dateTo)}` : null,
    filters.search ? `جستجو: ${filters.search}` : null,
  ].filter(Boolean);

  return (
    <div className="surface-card space-y-4 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">نوع فعالیت</span>
          <select
            value={filters.activityType ?? 'ALL'}
            onChange={(e) =>
              onChange({
                ...filters,
                activityType: e.target.value as ActivityType,
                page: 1,
                categoryId: undefined,
              })
            }
            className="field-input px-3 py-2"
          >
            {ACTIVITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">حساب</span>
          <select
            value={filters.accountId ?? ''}
            onChange={(e) =>
              onChange({ ...filters, accountId: e.target.value || undefined, page: 1 })
            }
            className="field-input px-3 py-2"
          >
            <option value="">همه حساب‌ها</option>
            {accounts?.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">دسته</span>
          <select
            value={filters.categoryId ?? ''}
            onChange={(e) =>
              onChange({ ...filters, categoryId: e.target.value || undefined, page: 1 })
            }
            disabled={filters.activityType === 'TRANSFER'}
            className="field-input px-3 py-2 disabled:bg-surface"
          >
            <option value="">همه دسته‌ها</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">مرتب‌سازی</span>
          <select
            value={sortValue}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split(':') as [
                ActivityListFilters['sortBy'],
                ActivityListFilters['sortOrder'],
              ];
              onChange({ ...filters, sortBy, sortOrder, page: 1 });
            }}
            className="field-input px-3 py-2"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">از تاریخ</span>
          <JalaliDateInput
            value={filters.dateFrom ?? ''}
            onChange={(isoDate) =>
              onChange({ ...filters, dateFrom: isoDate || undefined, page: 1 })
            }
            className="field-input px-3 py-2"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">تا تاریخ</span>
          <JalaliDateInput
            value={filters.dateTo ?? ''}
            onChange={(isoDate) =>
              onChange({ ...filters, dateTo: isoDate || undefined, page: 1 })
            }
            className="field-input px-3 py-2"
          />
        </label>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <span
              key={String(chip)}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
            >
              {chip}
            </span>
          ))}
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary-600 hover:underline"
          >
            پاک کردن فیلترها
          </button>
        </div>
      ) : null}
    </div>
  );
}
