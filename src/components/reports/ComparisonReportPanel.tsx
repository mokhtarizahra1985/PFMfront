import type { ComparisonReport } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';
import { formatMonthLabel } from '@/utils/date';
import { formatDifferenceLabel, formatPercentChange } from '@/utils/report-diff';

interface ComparisonReportPanelProps {
  report: ComparisonReport;
}

function ComparisonRow({
  label,
  current,
  previous,
  difference,
}: {
  label: string;
  current: number;
  previous: number;
  difference: number;
}) {
  const diffClass =
    difference > 0 ? 'text-green-700' : difference < 0 ? 'text-red-700' : 'text-slate-600';

  return (
    <tr className="border-t border-slate-100">
      <td className="px-4 py-3 font-medium text-slate-900">{label}</td>
      <td className="px-4 py-3">
        <MoneyText amount={current} />
      </td>
      <td className="px-4 py-3">
        <MoneyText amount={previous} />
      </td>
      <td className={`px-4 py-3 font-medium ${diffClass}`}>
        <MoneyText amount={Math.abs(difference)} />
        <span className="mt-1 block text-xs font-normal text-slate-500">
          {formatDifferenceLabel(difference)} · {formatPercentChange(current, previous)}
        </span>
      </td>
    </tr>
  );
}

export function ComparisonReportPanel({ report }: ComparisonReportPanelProps) {
  const currentLabel = formatMonthLabel(
    `${report.currentPeriod.year}-${String(report.currentPeriod.month).padStart(2, '0')}`,
  );
  const previousLabel = formatMonthLabel(
    `${report.previousPeriod.year}-${String(report.previousPeriod.month).padStart(2, '0')}`,
  );

  return (
    <div className="space-y-6">
      <section className="surface-card p-5">
        <h2 className="text-base font-semibold text-slate-900">خلاصه مقایسه</h2>
        <p className="mt-1 text-sm text-slate-500">
          {currentLabel} در مقایسه با {previousLabel}
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-right font-medium">شاخص</th>
                <th className="px-4 py-3 text-right font-medium">ماه جاری</th>
                <th className="px-4 py-3 text-right font-medium">ماه قبل</th>
                <th className="px-4 py-3 text-right font-medium">تفاوت</th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                label="درآمد"
                current={report.currentPeriod.totalIncome}
                previous={report.previousPeriod.totalIncome}
                difference={report.incomeDifference}
              />
              <ComparisonRow
                label="هزینه"
                current={report.currentPeriod.totalExpense}
                previous={report.previousPeriod.totalExpense}
                difference={report.expenseDifference}
              />
              <ComparisonRow
                label="تراز"
                current={report.currentPeriod.netAmount}
                previous={report.previousPeriod.netAmount}
                difference={report.netDifference}
              />
            </tbody>
          </table>
        </div>
      </section>

      {report.categoryDifferences.length > 0 ? (
        <section className="surface-card p-5">
          <h2 className="mb-4 text-base font-semibold text-slate-900">
            تفاوت هزینه در سطح دسته
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">دسته</th>
                  <th className="px-4 py-3 text-right font-medium">ماه جاری</th>
                  <th className="px-4 py-3 text-right font-medium">ماه قبل</th>
                  <th className="px-4 py-3 text-right font-medium">تفاوت</th>
                </tr>
              </thead>
              <tbody>
                {report.categoryDifferences.map((item) => {
                  const diffClass =
                    item.difference > 0
                      ? 'text-red-700'
                      : item.difference < 0
                        ? 'text-green-700'
                        : 'text-slate-600';

                  return (
                    <tr key={item.categoryId} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-900">{item.categoryName}</td>
                      <td className="px-4 py-3">
                        <MoneyText amount={item.currentAmount} />
                      </td>
                      <td className="px-4 py-3">
                        <MoneyText amount={item.previousAmount} />
                      </td>
                      <td className={`px-4 py-3 font-medium ${diffClass}`}>
                        {item.difference === 0 ? (
                          'بدون تغییر'
                        ) : (
                          <>
                            {item.difference > 0 ? '+' : '-'}
                            <MoneyText amount={Math.abs(item.difference)} />
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
