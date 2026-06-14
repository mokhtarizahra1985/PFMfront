import { apiClient } from './client';
import type {
  ApiResponse,
  ComparisonReport,
  ExpensesReport,
  MonthlyReport,
} from '@/types/api.types';

export const reportsApi = {
  getExpenses: async (dateFrom: string, dateTo: string): Promise<ExpensesReport> => {
    const { data } = await apiClient.get<ApiResponse<ExpensesReport>>('/reports/expenses', {
      params: { dateFrom, dateTo },
    });
    return normalizeExpensesReport(data.data);
  },

  getMonthly: async (year: number, month: number): Promise<MonthlyReport> => {
    const { data } = await apiClient.get<ApiResponse<MonthlyReport>>('/reports/monthly', {
      params: { year, month },
    });
    return normalizeMonthlyReport(data.data);
  },

  getComparison: async (year: number, month: number): Promise<ComparisonReport> => {
    const { data } = await apiClient.get<ApiResponse<ComparisonReport>>('/reports/comparison', {
      params: { year, month },
    });
    return normalizeComparisonReport(data.data);
  },
};

function normalizeExpensesReport(report: ExpensesReport): ExpensesReport {
  return {
    ...report,
    totalExpense: Number(report.totalExpense) || 0,
    byCategory: (report.byCategory ?? []).map((item) => ({
      ...item,
      total: Number(item.total) || 0,
      percentage: Number(item.percentage) || 0,
    })),
  };
}

function normalizeMonthlyReport(report: MonthlyReport): MonthlyReport {
  return {
    ...report,
    totalIncome: Number(report.totalIncome) || 0,
    totalExpense: Number(report.totalExpense) || 0,
    netAmount: Number(report.netAmount) || 0,
    highestExpense: report.highestExpense
      ? {
          ...report.highestExpense,
          amount: Number(report.highestExpense.amount) || 0,
        }
      : null,
    topExpenseCategory: report.topExpenseCategory
      ? {
          ...report.topExpenseCategory,
          total: Number(report.topExpenseCategory.total) || 0,
        }
      : null,
    expensesByCategory: (report.expensesByCategory ?? []).map((item) => ({
      ...item,
      total: Number(item.total) || 0,
      percentage: Number(item.percentage) || 0,
    })),
    budgets: (report.budgets ?? []).map((item) => ({
      ...item,
      limitAmount: Number(item.limitAmount) || 0,
      spentAmount: Number(item.spentAmount) || 0,
      percentage: Number(item.percentage) || 0,
    })),
  };
}

function normalizeComparisonReport(report: ComparisonReport): ComparisonReport {
  const normalizePeriod = (period: ComparisonReport['currentPeriod']) => ({
    ...period,
    totalIncome: Number(period.totalIncome) || 0,
    totalExpense: Number(period.totalExpense) || 0,
    netAmount: Number(period.netAmount) || 0,
  });

  return {
    ...report,
    currentPeriod: normalizePeriod(report.currentPeriod),
    previousPeriod: normalizePeriod(report.previousPeriod),
    incomeDifference: Number(report.incomeDifference) || 0,
    expenseDifference: Number(report.expenseDifference) || 0,
    netDifference: Number(report.netDifference) || 0,
    categoryDifferences: (report.categoryDifferences ?? []).map((item) => ({
      ...item,
      currentAmount: Number(item.currentAmount) || 0,
      previousAmount: Number(item.previousAmount) || 0,
      difference: Number(item.difference) || 0,
    })),
  };
}
