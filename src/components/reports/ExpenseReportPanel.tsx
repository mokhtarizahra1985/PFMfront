import type { ExpensesReport } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { EmptyState } from '@/components/shared/EmptyState';
import { ExpenseCategoryChart } from '@/components/reports/ExpenseCategoryChart';
import { CategoryExpenseList } from '@/components/reports/CategoryExpenseList';
import { formatDisplayDate } from '@/utils/date';

interface ExpenseReportPanelProps {
  report: ExpensesReport;
}

export function ExpenseReportPanel({ report }: ExpenseReportPanelProps) {
  if (report.totalExpense === 0 || report.byCategory.length === 0) {
    return (
      <EmptyState
        title="هزینه‌ای در این بازه ثبت نشده"
        description="برای مشاهده الگوی خرج، در این بازه زمانی هزینه ثبت کنید."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-card p-5">
        <p className="text-sm text-slate-500">
          بازه: {formatDisplayDate(report.dateFrom)} تا {formatDisplayDate(report.dateTo)}
        </p>
        <p className="mt-2 text-2xl font-bold text-red-700">
          مجموع هزینه: <MoneyText amount={report.totalExpense} />
        </p>
      </section>

      <section className="surface-card p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">نمودار دسته‌بندی</h2>
        <ExpenseCategoryChart items={report.byCategory} />
      </section>

      <section className="surface-card p-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900">جزئیات دسته‌ها</h2>
        <CategoryExpenseList
          items={report.byCategory}
          dateFrom={report.dateFrom}
          dateTo={report.dateTo}
        />
      </section>
    </div>
  );
}
