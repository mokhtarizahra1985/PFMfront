import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/api/reports.api';

export const MONTHLY_REPORT_QUERY_KEY = 'monthly-report';
export const EXPENSES_REPORT_QUERY_KEY = 'expenses-report';
export const COMPARISON_REPORT_QUERY_KEY = 'comparison-report';

export function useMonthlyReport(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: [MONTHLY_REPORT_QUERY_KEY, year, month],
    queryFn: () => reportsApi.getMonthly(year, month),
    enabled,
  });
}

export function useExpensesReport(
  dateFrom: string,
  dateTo: string,
  enabled = true,
) {
  return useQuery({
    queryKey: [EXPENSES_REPORT_QUERY_KEY, dateFrom, dateTo],
    queryFn: () => reportsApi.getExpenses(dateFrom, dateTo),
    enabled: enabled && Boolean(dateFrom && dateTo),
  });
}

export function useComparisonReport(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: [COMPARISON_REPORT_QUERY_KEY, year, month],
    queryFn: () => reportsApi.getComparison(year, month),
    enabled,
  });
}
