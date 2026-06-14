import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@/routes/guards';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AccountsPage } from '@/pages/AccountsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { NewTransactionPage } from '@/pages/NewTransactionPage';
import { EditTransactionPage } from '@/pages/EditTransactionPage';
import { BudgetsPage } from '@/pages/BudgetsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { GoalDetailPage } from '@/pages/GoalDetailPage';
import { RecurringPage } from '@/pages/RecurringPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

      <Route element={<GuestRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/new" element={<NewTransactionPage />} />
          <Route path="transactions/:id/edit" element={<EditTransactionPage />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="goals/:id" element={<GoalDetailPage />} />
          <Route path="recurring" element={<RecurringPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
