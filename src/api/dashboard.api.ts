import { apiClient } from './client';
import type {
  ApiResponse,
  DashboardBudgetSummary,
  DashboardData,
  DashboardGoalSummary,
  DashboardRecentActivity,
  DashboardTopExpenseCategory,
  TransactionType,
} from '@/types/api.types';

type RawDashboardActivity = {
  id: string;
  kind: 'TRANSACTION' | 'TRANSFER';
  type: TransactionType | 'TRANSFER';
  title: string;
  amount: number;
  date: string;
  category_name?: string;
  category_icon?: string;
  categoryName?: string;
  categoryIcon?: string;
  source_name?: string;
  dest_name?: string;
  sourceName?: string;
  destName?: string;
};

type RawDashboardData = {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  topExpenseCategory: DashboardTopExpenseCategory | null;
  budgetSummary: DashboardBudgetSummary[];
  recentActivities: RawDashboardActivity[];
  activeGoalSummary: DashboardGoalSummary[];
};

export const dashboardApi = {
  get: async (month: string): Promise<DashboardData> => {
    const { data } = await apiClient.get<ApiResponse<RawDashboardData>>('/dashboard', {
      params: { month },
    });
    return normalizeDashboard(data.data);
  },
};

function normalizeDashboard(raw: RawDashboardData): DashboardData {
  return {
    totalBalance: Number(raw.totalBalance) || 0,
    monthlyIncome: Number(raw.monthlyIncome) || 0,
    monthlyExpense: Number(raw.monthlyExpense) || 0,
    monthlyNet: Number(raw.monthlyNet) || 0,
    topExpenseCategory: raw.topExpenseCategory
      ? {
          id: raw.topExpenseCategory.id,
          name: raw.topExpenseCategory.name,
          total: Number(raw.topExpenseCategory.total) || 0,
        }
      : null,
    budgetSummary: (raw.budgetSummary ?? []).map((item) => ({
      ...item,
      limitAmount: Number(item.limitAmount) || 0,
      spentAmount: Number(item.spentAmount) || 0,
      percentage: Number(item.percentage) || 0,
    })),
    recentActivities: (raw.recentActivities ?? []).map(normalizeRecentActivity),
    activeGoalSummary: (raw.activeGoalSummary ?? []).map((goal) => ({
      ...goal,
      targetAmount: Number(goal.targetAmount) || 0,
      savedAmount: Number(goal.savedAmount) || 0,
      percentage: Number(goal.percentage) || 0,
    })),
  };
}

function normalizeRecentActivity(raw: RawDashboardActivity): DashboardRecentActivity {
  if (raw.kind === 'TRANSFER') {
    return {
      id: raw.id,
      kind: 'TRANSFER',
      type: 'TRANSFER',
      title: raw.title,
      amount: Number(raw.amount) || 0,
      date: raw.date,
      sourceName: raw.source_name ?? raw.sourceName,
      destName: raw.dest_name ?? raw.destName,
    };
  }

  return {
    id: raw.id,
    kind: 'TRANSACTION',
    type: raw.type as TransactionType,
    title: raw.title,
    amount: Number(raw.amount) || 0,
    date: raw.date,
    categoryName: raw.category_name ?? raw.categoryName,
    categoryIcon: raw.category_icon ?? raw.categoryIcon,
  };
}
