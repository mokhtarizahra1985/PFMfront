# Frontend V1 — Progress Tracker

> **Scope authority:** all work must follow [`docs/PROJECT_SCOPE.md`](../docs/PROJECT_SCOPE.md)  
> Derived from: `docs/main project.md`, `docs/frontend agent.md`, `docs/API_CONTRACT.md`

---

## Wave Status (aligned with PROJECT_SCOPE.md)

| Wave | Sprint ref | Stories | Status |
|------|------------|---------|--------|
| 0 | Sprint 0 | Auth base, F01 | ✅ Done |
| 1 | Sprint 1 | F02–F06 | ✅ Done |
| 2 | Sprint 2 | F07–F09, F17–F18 | ✅ Done |
| 3 | Sprint 3 | F11 | ✅ Done |
| 4 | Sprint 3 | F12–F13 | ✅ Done |
| 5 | Sprint 3 | F14–F15, F26 | ✅ Done |
| 6 | Sprint 5 (V1 goals) | F22–F23 | ✅ Done |
| 7 | Sprint 8 | DoD, tests, polish | ✅ Done |

---

## Completed Work

### Wave 0 — Scaffold + Auth + Settings (F01)
- Vite + React + TypeScript + Tailwind v4 RTL + Vazirmatn
- Axios client, JWT, 401 handling, route guards
- Login, Register, Settings (Rial/Toman)
- AppLayout, mobile nav, shared UI primitives

### Wave 1 — Accounts + Categories + Transaction Forms (F02–F06)
- `accounts.api.ts`, `categories.api.ts`, hooks
- AccountsPage, CategoriesPage
- NewTransactionPage: expense / income / transfer tabs

### Wave 2 — Transaction Management (F07–F09, F17–F18)
- TransactionsPage: list, search (debounce), filters, sort, pagination
- EditTransactionPage
- Delete + undo restore
- Transfer delete with confirmation

### Wave 3 — Dashboard (F11)
- `dashboard.api.ts`, `useDashboard`
- Stat cards, month picker, quick actions
- Top category, budget summary (read-only), recent activities, goals summary (read-only)
- `StatCard`, dashboard section components

### Wave 4 — Budgets (F12 + F13)
- `budgets.api.ts`, `useBudgets`, `budget.schema.ts`
- `BudgetsPage` with month picker, CRUD, unbudgeted categories section
- `BudgetCard` with progress, status labels, remaining/exceeded amounts
- `utils/budget-status.ts` shared with dashboard summary

### Wave 5 — Reports (F14, F15, F26)
- `reports.api.ts`, `useReports`
- `ReportsPage` with tabs: monthly, expenses by category, comparison
- Donut chart (CSS) + category list with transaction links
- `MonthlyReportPanel`, `ExpenseReportPanel`, `ComparisonReportPanel`

### Wave 6 — Goals (F22, F23)
- `goals.api.ts`, `useGoals`, `goal.schema.ts`
- `GoalsPage`, `GoalDetailPage`, `GoalCard`

### Wave 7 — Definition of Done
- Removed unused `PlaceholderPage`
- Added `.env.example`
- Unit tests: money, date, report-diff, transaction-filters, schemas
- Updated `README.md` with full V1 routes and setup from clean clone

---

## Verification Checklist (run locally)

```bash
cd frontend
npm run lint
npm run test
npm run build
```

---

## Placeholder Routes

همه Placeholderها حذف شدند. ✅

## Query Keys

```
['settings']
['accounts']
['categories', type]
['transactions', activityType, filters]
['transfers', params]
['transaction', id]
['dashboard', month]
['budgets', month]
['monthly-report', month]
['expenses-report', dateFrom, dateTo]
['comparison-report', year, month]
['goals']
['goal', id]
['goal-progress', id]
['goal-contributions', id]
['current-user']            ← AuthContext bootstrap
```

---

## Definition of Done

See `frontend agent.md` §30 and `docs/PROJECT_SCOPE.md` §8.
