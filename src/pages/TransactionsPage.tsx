import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ActivityItem } from '@/types/api.types';
import {
  useActivityList,
  useTransactionMutations,
  useTransferMutations,
} from '@/hooks/useTransactions';
import {
  buildActivitySearchParams,
  parseActivityFilters,
  type ActivityListFilters,
} from '@/utils/transaction-filters';
import { PageHeader } from '@/components/shared/PageHeader';
import { ActivityListItem } from '@/components/shared/ActivityListItem';
import { TransactionFiltersPanel } from '@/components/shared/TransactionFiltersPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';

export function TransactionsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');
  const [pendingDelete, setPendingDelete] = useState<ActivityItem | null>(null);
  const [undoState, setUndoState] = useState<{ id: string; title: string } | null>(
    null,
  );

  const filters = useMemo(
    () => parseActivityFilters(searchParams),
    [searchParams],
  );

  const activityType = filters.activityType ?? 'ALL';
  const { items, meta, isLoading, isError, refetch } = useActivityList(
    activityType,
    filters,
  );

  const { deleteMutation, restoreMutation } = useTransactionMutations();
  const { deleteMutation: deleteTransferMutation } = useTransferMutations();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput.trim()) {
          next.set('search', searchInput.trim());
        } else {
          next.delete('search');
        }
        next.set('page', '1');
        return next;
      }, { replace: true });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, setSearchParams]);

  const updateFilters = (next: ActivityListFilters) => {
    const params = buildActivitySearchParams(next);
    setSearchParams(params, { replace: true });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    try {
      if (pendingDelete.kind === 'TRANSACTION') {
        await deleteMutation.mutateAsync(pendingDelete.data.id);
        setUndoState({
          id: pendingDelete.data.id,
          title: pendingDelete.data.title,
        });
      } else {
        await deleteTransferMutation.mutateAsync(pendingDelete.data.id);
      }
      setPendingDelete(null);
    } catch {
      setPendingDelete(null);
    }
  };

  const handleUndo = async () => {
    if (!undoState) return;
    await restoreMutation.mutateAsync(undoState.id);
    setUndoState(null);
  };

  const goToPage = (page: number) => {
    updateFilters({ ...filters, page });
  };

  return (
    <div>
      <PageHeader
        title="تراکنش‌ها"
        description="لیست درآمد، هزینه و انتقال‌های شما"
        actions={
          <Link
            to="/app/transactions/new"
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            + افزودن
          </Link>
        }
      />

      <div className="mb-4 flex gap-2">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="جستجو در عنوان..."
          className="field-input"
        />
        {searchInput ? (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="shrink-0 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            پاک کردن
          </button>
        ) : null}
      </div>

      <div className="mb-6">
        <TransactionFiltersPanel
          filters={filters}
          onChange={updateFilters}
          onClear={clearFilters}
        />
      </div>

      {undoState ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>«{undoState.title}» حذف شد.</span>
          <button
            type="button"
            onClick={() => void handleUndo()}
            className="font-medium text-green-900 hover:underline"
          >
            بازگردانی
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSkeleton variant="table" />
      ) : isError ? (
        <ErrorState
          message="بارگذاری تراکنش‌ها با خطا مواجه شد."
          onRetry={() => void refetch()}
        />
      ) : !items.length ? (
        <EmptyState
          title="تراکنشی یافت نشد"
          description="هنوز تراکنشی ثبت نشده یا با فیلترهای فعلی موردی پیدا نشد."
          action={
            <button
              type="button"
              onClick={() => navigate('/app/transactions/new')}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white"
            >
              ثبت اولین تراکنش
            </button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <ActivityListItem
                key={`${item.kind}-${item.data.id}`}
                item={item}
                onDelete={setPendingDelete}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => goToPage(meta.page - 1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-50"
              >
                قبلی
              </button>
              <span className="text-sm text-slate-600">
                صفحه {meta.page} از {meta.totalPages}
              </span>
              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => goToPage(meta.page + 1)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-50"
              >
                بعدی
              </button>
            </div>
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="حذف فعالیت"
        message={
          pendingDelete?.kind === 'TRANSACTION'
            ? `آیا از حذف «${pendingDelete.data.title}» مطمئن هستید؟`
            : 'آیا از حذف این انتقال مطمئن هستید؟'
        }
        confirmLabel="حذف"
        isLoading={deleteMutation.isPending || deleteTransferMutation.isPending}
        onConfirm={() => void handleDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
