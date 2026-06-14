import { useSearchParams } from 'react-router-dom';
import {
  currentMonthParam,
  formatMonthLabel,
  monthDateRange,
  parseMonthParam,
  shiftMonth,
} from '@/utils/date';
import {
  useComparisonReport,
  useExpensesReport,
  useMonthlyReport,
} from '@/hooks/useReports';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton';
import { MonthlyReportPanel } from '@/components/reports/MonthlyReportPanel';
import { ExpenseReportPanel } from '@/components/reports/ExpenseReportPanel';
import { ComparisonReportPanel } from '@/components/reports/ComparisonReportPanel';

type ReportTab = 'monthly' | 'expenses' | 'comparison';

const REPORT_TABS: { id: ReportTab; label: string }[] = [
  { id: 'monthly', label: 'گزارش ماهانه' },
  { id: 'expenses', label: 'هزینه بر اساس دسته' },
  { id: 'comparison', label: 'مقایسه با ماه قبل' },
];

export function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const monthParam = searchParams.get('month') ?? currentMonthParam();
  const tab = (searchParams.get('tab') as ReportTab) || 'monthly';
  const { year, month } = parseMonthParam(monthParam);
  const { dateFrom, dateTo } = monthDateRange(monthParam);

  const monthlyQuery = useMonthlyReport(year, month, tab === 'monthly');
  const expensesQuery = useExpensesReport(dateFrom, dateTo, tab === 'expenses');
  const comparisonQuery = useComparisonReport(year, month, tab === 'comparison');

  const activeQuery =
    tab === 'monthly'
      ? monthlyQuery
      : tab === 'expenses'
        ? expensesQuery
        : comparisonQuery;

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

  const setTab = (nextTab: ReportTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextTab === 'monthly') {
          next.delete('tab');
        } else {
          next.set('tab', nextTab);
        }
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div>
      <PageHeader
        title="گزارش‌ها"
        description="تحلیل درآمد، هزینه و روند مالی در بازه زمانی انتخاب‌شده"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2 surface-segment">
        {REPORT_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={[
              'flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition',
              tab === item.id
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center gap-2 surface-segment">
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(monthParam, -1))}
          className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          aria-label="ماه قبل"
        >
          ‹
        </button>
        <span className="min-w-24 flex-1 text-center text-sm font-medium text-slate-900">
          {formatMonthLabel(monthParam)}
        </span>
        <button
          type="button"
          onClick={() => setMonth(shiftMonth(monthParam, 1))}
          className="rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          aria-label="ماه بعد"
        >
          ›
        </button>
      </div>

      {activeQuery.isLoading ? <LoadingSkeleton variant="page" /> : null}

      {activeQuery.isError ? (
        <ErrorState
          message="بارگذاری گزارش با خطا مواجه شد."
          onRetry={() => void activeQuery.refetch()}
        />
      ) : null}

      {!activeQuery.isLoading && !activeQuery.isError ? (
        <>
          {tab === 'monthly' && monthlyQuery.data ? (
            <MonthlyReportPanel report={monthlyQuery.data} />
          ) : null}
          {tab === 'expenses' && expensesQuery.data ? (
            <ExpenseReportPanel report={expensesQuery.data} />
          ) : null}
          {tab === 'comparison' && comparisonQuery.data ? (
            <ComparisonReportPanel report={comparisonQuery.data} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
