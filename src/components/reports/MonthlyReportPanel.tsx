import { Link } from 'react-router-dom';
import type { MonthlyReport } from '@/types/api.types';
import { StatCard } from '@/components/shared/StatCard';
import { MoneyText } from '@/components/shared/MoneyText';
import { EmptyState } from '@/components/shared/EmptyState';
import { BudgetSummaryItem } from '@/components/dashboard/BudgetSummaryItem';
import { ExpenseCategoryChart } from '@/components/reports/ExpenseCategoryChart';
import { CategoryExpenseList } from '@/components/reports/CategoryExpenseList';
import { monthDateRange } from '@/utils/date';

interface MonthlyReportPanelProps {
  report: MonthlyReport;
}

export function MonthlyReportPanel({ report }: MonthlyReportPanelProps) {
  const monthParam = `${report.year}-${String(report.month).padStart(2, '0')}`;
  const { dateFrom, dateTo } = monthDateRange(monthParam);
  const netTone =
    report.netAmount > 0 ? 'income' : report.netAmount < 0 ? 'expense' : 'neutral';
  const isEmpty = report.totalIncome === 0 && report.totalExpense === 0;

  if (isEmpty) {
    return (
      <EmptyState
        title="داده‌ای برای این ماه وجود ندارد"
        description="با ثبت درآمد یا هزینه در این ماه، گزارش ماهانه پر می‌شود."
        action={
          <Link
            to="/app/transactions/new?type=expense"
            className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            ثبت تراکنش
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="درآمد ماه" amount={report.totalIncome} tone="income" />
        <StatCard title="هزینه ماه" amount={report.totalExpense} tone="expense" />
        <StatCard title="تراز ماه" amount={report.netAmount} tone={netTone} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {report.highestExpense ? (
          <section className="surface-card p-5">
            <h2 className="text-base font-semibold text-slate-900">بزرگ‌ترین هزینه</h2>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {report.highestExpense.title}
            </p>
            <p className="mt-1 text-red-700">
              <MoneyText amount={report.highestExpense.amount} />
            </p>
          </section>
        ) : null}

        {report.topExpenseCategory ? (
          <section className="surface-card p-5">
            <h2 className="text-base font-semibold text-slate-900">پرخرج‌ترین دسته</h2>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {report.topExpenseCategory.categoryName}
            </p>
            <p className="mt-1 text-red-700">
              <MoneyText amount={report.topExpenseCategory.total} />
            </p>
          </section>
        ) : null}
      </div>

      {report.expensesByCategory.length > 0 ? (
        <section className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">هزینه بر اساس دسته</h2>
            <Link
              to={`/app/transactions?type=EXPENSE&dateFrom=${dateFrom}&dateTo=${dateTo}`}
              className="text-xs text-primary-600 hover:underline"
            >
              همه تراکنش‌های ماه
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <ExpenseCategoryChart items={report.expensesByCategory} />
            <CategoryExpenseList
              items={report.expensesByCategory}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          </div>
        </section>
      ) : null}

      {report.budgets.length > 0 ? (
        <section className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">وضعیت بودجه‌ها</h2>
            <Link to="/app/budgets" className="text-xs text-primary-600 hover:underline">
              مدیریت بودجه
            </Link>
          </div>
          {report.budgets.map((budget) => (
            <BudgetSummaryItem
              key={budget.id}
              budget={{
                id: budget.id,
                categoryName: budget.categoryName,
                limitAmount: budget.limitAmount,
                spentAmount: budget.spentAmount,
                percentage: budget.percentage,
                status: budget.status,
              }}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}
