import { Link } from 'react-router-dom';
import type { ExpenseCategoryReportItem } from '@/types/api.types';
import { MoneyText } from '@/components/shared/MoneyText';

interface CategoryExpenseListProps {
  items: ExpenseCategoryReportItem[];
  dateFrom: string;
  dateTo: string;
}

export function CategoryExpenseList({
  items,
  dateFrom,
  dateTo,
}: CategoryExpenseListProps) {
  if (items.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 text-right font-medium">دسته</th>
            <th className="px-4 py-3 text-right font-medium">مبلغ</th>
            <th className="px-4 py-3 text-right font-medium">سهم</th>
            <th className="px-4 py-3 text-right font-medium">جزئیات</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.categoryId} className="border-t border-slate-100">
              <td className="px-4 py-3 text-slate-900">
                {item.categoryIcon} {item.categoryName}
              </td>
              <td className="px-4 py-3 font-medium text-slate-900">
                <MoneyText amount={item.total} />
              </td>
              <td className="px-4 py-3 text-slate-600">{item.percentage}٪</td>
              <td className="px-4 py-3">
                <Link
                  to={`/app/transactions?type=EXPENSE&categoryId=${item.categoryId}&dateFrom=${dateFrom}&dateTo=${dateTo}`}
                  className="text-primary-600 hover:underline"
                >
                  تراکنش‌ها
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
