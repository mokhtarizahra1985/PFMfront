import type { ExpenseCategoryReportItem } from '@/types/api.types';
import { useMoney } from '@/hooks/useMoney';

const CHART_COLORS = [
  '#2563eb',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#64748b',
];

interface ExpenseCategoryChartProps {
  items: ExpenseCategoryReportItem[];
}

export function ExpenseCategoryChart({ items }: ExpenseCategoryChartProps) {
  const { formatMoney } = useMoney();

  if (items.length === 0) return null;

  const gradientStops = items.reduce<{ parts: string[]; offset: number }>(
    (acc, item, index) => {
      const color = CHART_COLORS[index % CHART_COLORS.length];
      const nextOffset = acc.offset + item.percentage;
      acc.parts.push(`${color} ${acc.offset}% ${nextOffset}%`);
      acc.offset = nextOffset;
      return acc;
    },
    { parts: [], offset: 0 },
  ).parts;

  return (
    <div>
      <div
        className="mx-auto flex h-64 w-64 items-center justify-center"
        role="img"
        aria-label="نمودار سهم هزینه‌ها بر اساس دسته"
      >
        <div
          className="relative h-52 w-52 rounded-full"
          style={{
            background: `conic-gradient(${gradientStops.join(', ')})`,
          }}
        >
          <div className="absolute inset-8 flex items-center justify-center rounded-full bg-surface-elevated text-center">
            <div>
              <p className="text-xs text-slate-500">مجموع</p>
              <p className="text-sm font-semibold text-slate-900">
                {formatMoney(items.reduce((sum, item) => sum + item.total, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-2" aria-label="فهرست دسته‌های هزینه">
        {items.map((item, index) => (
          <li
            key={item.categoryId}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                aria-hidden="true"
              />
              {item.categoryIcon} {item.categoryName}
            </span>
            <span className="text-slate-500">
              {item.percentage}٪ · {formatMoney(item.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
