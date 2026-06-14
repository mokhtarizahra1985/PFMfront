export interface ApiResponse<T> {
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export type CurrencyDisplay = 'RIAL' | 'TOMAN';

export interface User {
  id: string;
  email: string;
  firstName: string;
  createdAt?: string;
}

export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface Settings {
  id: string;
  currencyDisplay: CurrencyDisplay;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = 'CASH' | 'BANK_ACCOUNT' | 'BANK_CARD' | 'DIGITAL_WALLET';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  isActive: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageResponse {
  message: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  accountId: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  accountName?: string;
  transactionDate: string;
  note: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'transactionDate' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export type ActivityType = 'ALL' | TransactionType | 'TRANSFER';

export interface Transfer {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  transferDate: string;
  note: string | null;
  deletedAt: string | null;
  sourceAccountName?: string;
  destinationAccountName?: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityItem =
  | { kind: 'TRANSACTION'; data: Transaction }
  | { kind: 'TRANSFER'; data: Transfer };

export type BudgetStatus = 'SAFE' | 'WARNING' | 'EXCEEDED';

export interface DashboardTopExpenseCategory {
  id: string;
  name: string;
  total: number;
}

export interface DashboardBudgetSummary {
  id: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  percentage: number;
  status: BudgetStatus;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  year: number;
  month: number;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  exceededAmount: number;
  percentage: number;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardRecentActivity {
  id: string;
  kind: 'TRANSACTION' | 'TRANSFER';
  type: TransactionType | 'TRANSFER';
  title: string;
  amount: number;
  date: string;
  categoryName?: string;
  categoryIcon?: string;
  sourceName?: string;
  destName?: string;
}

export interface DashboardGoalSummary {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  percentage: number;
}

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  topExpenseCategory: DashboardTopExpenseCategory | null;
  budgetSummary: DashboardBudgetSummary[];
  recentActivities: DashboardRecentActivity[];
  activeGoalSummary: DashboardGoalSummary[];
}

export interface ExpenseCategoryReportItem {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  total: number;
  percentage: number;
  transactionCount?: number;
}

export interface ExpensesReport {
  dateFrom: string;
  dateTo: string;
  totalExpense: number;
  byCategory: ExpenseCategoryReportItem[];
}

export interface MonthlyReportBudgetItem {
  id: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  spentAmount: number;
  percentage: number;
  status: BudgetStatus;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  highestExpense: { title: string; amount: number } | null;
  topExpenseCategory: {
    categoryId: string;
    categoryName: string;
    total: number;
  } | null;
  expensesByCategory: ExpenseCategoryReportItem[];
  budgets: MonthlyReportBudgetItem[];
}

export interface ReportPeriodSummary {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
}

export interface CategoryDifference {
  categoryId: string;
  categoryName: string;
  currentAmount: number;
  previousAmount: number;
  difference: number;
}

export interface ComparisonReport {
  currentPeriod: ReportPeriodSummary;
  previousPeriod: ReportPeriodSummary;
  incomeDifference: number;
  expenseDifference: number;
  netDifference: number;
  categoryDifferences: CategoryDifference[];
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export interface Goal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  savedAmount: number;
  remainingAmount: number;
  percentage: number;
  targetDate: string | null;
  note: string | null;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  targetAmount: number;
  savedAmount: number;
  remainingAmount: number;
  percentage: number;
  status: GoalStatus;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  contributionDate: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RecurringFrequency = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface RecurringTransaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  accountId: string;
  accountName?: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  frequency: RecurringFrequency;
  startDate: string;
  endDate: string | null;
  nextRunDate: string;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
