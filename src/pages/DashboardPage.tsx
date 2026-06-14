import type { ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { currentMonthParam, formatMonthLabel, monthDateRange, shiftMonth } from '@/utils/date';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { MoneyText } from '@/components/shared/MoneyText';
import { DashboardRecentActivityItem } from '@/components/dashboard/DashboardRecentActivityItem';
import { BudgetSummaryItem } from '@/components/dashboard/BudgetSummaryItem';
import { GoalSummaryItem } from '@/components/dashboard/GoalSummaryItem';

const QUICK_ACTIONS = [
  { label: 'ثبت هزینه', href: '/app/transactions/new?type=expense', className: 'bg-red-50 text-red-700 hover:bg-red-100' },
  { label: 'ثبت درآمد', href: '/app/transactions/new?type=income', className: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { label: 'انتقال وجه', href: '/app/transactions/new?type=transfer', className: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
  { label: 'ساخت هدف', href: '/app/goals', className: 'bg-primary-50 text-primary-700 hover:bg-primary-100' },
] as const;

function SectionCard({
  title,
  href,
  children,
  emptyMessage,
  isEmpty,
}: {
  title: string;
  href?: string;
  children: ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
}) {
  return (
    <section className="surface-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {href ? (
          <Link to={href} className="text-xs text-primary-600 hover:underline">
            مشاهده همه
          </Link>
        ) : null}
      </div>
      {isEmpty && emptyMessage ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const month = searchParams.get('month') ?? currentMonthParam();
  const { dateFrom, dateTo } = monthDateRange(month);
  const { data, isLoading, isError, refetch } = useDashboard(month);

  const setMonth = (nextMonth: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextMonth === currentMonthParam()) {
          next.delete('month');
        } else {
          next.set('month', nextMonth);
        }
        return next;
      },
      { replace: true },
    );
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="داشبورد" description="وضعیت مالی شما در این ماه" />
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div>
        <PageHeader title="داشبورد" description="وضعیت مالی شما در این ماه" />
        <ErrorState
          message="بارگذاری داشبورد با خطا مواجه شد."
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const isNewUser =
    data.totalBalance === 0 &&
    data.monthlyIncome === 0 &&
    data.monthlyExpense === 0 &&
    data.recentActivities.length === 0;

  const netTone =
    data.monthlyNet > 0 ? 'income' : data.monthlyNet < 0 ? 'expense' : 'neutral';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`سلام ${user?.firstName ?? 'کاربر'} 👋`}
        description="وضعیت مالی شما در این ماه"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="surface-segment flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, -1))}
            className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-surface"
            aria-label="ماه قبل"
          >
            ‹
          </button>
          <span className="min-w-24 px-2 text-center text-sm font-medium text-slate-900">
            {formatMonthLabel(month)}
          </span>
          <button
            type="button"
            onClick={() => setMonth(shiftMonth(month, 1))}
            className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-surface"
            aria-label="ماه بعد"
          >
            ›
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${action.className}`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {isNewUser ? (
        <EmptyState
          title="هنوز فعالیتی ثبت نشده"
          description="با ساخت حساب و ثبت اولین تراکنش، داشبورد شما زنده می‌شود."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/app/accounts"
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                ساخت حساب
              </Link>
              <Link
                to="/app/transactions/new?type=expense"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                ثبت اولین هزینه
              </Link>
            </div>
          }
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="موجودی کل"
          amount={data.totalBalance}
          href="/app/accounts"
          subtitle={data.totalBalance < 0 ? 'موجودی منفی' : undefined}
          tone={data.totalBalance < 0 ? 'expense' : 'default'}
        />
        <StatCard
          title="درآمد ماه"
          amount={data.monthlyIncome}
          tone="income"
          href={`/app/transactions?type=INCOME&dateFrom=${dateFrom}&dateTo=${dateTo}`}
        />
        <StatCard
          title="هزینه ماه"
          amount={data.monthlyExpense}
          tone="expense"
          href={`/app/transactions?type=EXPENSE&dateFrom=${dateFrom}&dateTo=${dateTo}`}
        />
        <StatCard
          title="تراز ماه"
          amount={data.monthlyNet}
          tone={netTone}
          subtitle={data.monthlyNet >= 0 ? 'درآمد بیشتر از هزینه' : 'هزینه بیشتر از درآمد'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="پرخرج‌ترین دسته"
          href="/app/reports"
          isEmpty={!data.topExpenseCategory}
          emptyMessage="در این ماه هنوز هزینه‌ای ثبت نشده."
        >
          {data.topExpenseCategory ? (
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {data.topExpenseCategory.name}
                </p>
                <p className="mt-1 text-sm text-slate-500">بیشترین مصرف این ماه</p>
              </div>
              <p className="text-xl font-bold text-red-700">
                <MoneyText amount={data.topExpenseCategory.total} />
              </p>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="وضعیت بودجه‌ها"
          href="/app/budgets"
          isEmpty={data.budgetSummary.length === 0}
          emptyMessage="بودجه‌ای برای این ماه تعریف نشده. از بخش بودجه سقف ماهانه تعیین کنید."
        >
          {data.budgetSummary.map((budget) => (
            <BudgetSummaryItem key={budget.id} budget={budget} />
          ))}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="آخرین فعالیت‌ها"
          href="/app/transactions"
          isEmpty={data.recentActivities.length === 0}
          emptyMessage="هنوز تراکنش یا انتقالی ثبت نشده."
        >
          {data.recentActivities.map((activity) => (
            <DashboardRecentActivityItem key={`${activity.kind}-${activity.id}`} activity={activity} />
          ))}
        </SectionCard>

        <SectionCard
          title="اهداف فعال"
          href="/app/goals"
          isEmpty={data.activeGoalSummary.length === 0}
          emptyMessage="هدف فعالی ندارید. یک هدف بسازید و با «ثبت واریز» پس‌انداز را ثبت کنید."
        >
          {data.activeGoalSummary.map((goal) => (
            <GoalSummaryItem key={goal.id} goal={goal} />
          ))}
        </SectionCard>
      </div>
    </div>
  );
}
