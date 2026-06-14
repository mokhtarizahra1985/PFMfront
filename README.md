# Personal Finance Frontend — V1

Frontend for the Personal Finance Manager application (Persian UI, RTL).

Progress details: [`README-V1-FRONTEND.md`](./README-V1-FRONTEND.md)  
Scope reference: [`../docs/PROJECT_SCOPE.md`](../docs/PROJECT_SCOPE.md)

## Stack

- React 19 + TypeScript
- Vite 6
- React Router 7
- TanStack Query
- React Hook Form + Zod
- Tailwind CSS v4 (RTL)
- Axios
- Vitest + React Testing Library

## Prerequisites

- Node.js 20+
- Backend running at `http://localhost:3000`

## Installation (clean clone)

```bash
cd frontend
npm install
cp .env.example .env
```

## Environment

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Commands

```bash
npm run dev       # http://localhost:5173
npm run build     # typecheck + production bundle
npm run preview   # preview production build
npm run lint      # ESLint
npm run test      # Vitest unit tests
```

## Demo Account

```
Email:    demo@finance.local
Password: demo1234
```

## Application Routes (V1 complete)

| Route | Page |
|-------|------|
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/app/dashboard` | Dashboard (API) |
| `/app/accounts` | Accounts CRUD |
| `/app/categories` | Categories CRUD |
| `/app/transactions` | Activity list + filters |
| `/app/transactions/new` | New income / expense / transfer |
| `/app/transactions/:id/edit` | Edit transaction |
| `/app/budgets` | Monthly budgets |
| `/app/reports` | Monthly / expense / comparison reports |
| `/app/goals` | Saving goals list |
| `/app/goals/:id` | Goal detail + contributions |
| `/app/settings` | Rial / Toman display |

## Backend

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

## Development (two terminals)

**Terminal 1 — backend (repo root):**

```bash
npm install
cp .env.example .env
npm run start:dev
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Project Structure

```text
frontend/
  src/
    api/           # Axios API modules
    components/    # Shared + feature UI
    contexts/      # Auth
    hooks/         # TanStack Query hooks
    layouts/       # App + Auth layouts
    pages/         # Route pages
    routes/        # Router + guards
    schemas/       # Zod form schemas
    types/         # Shared TypeScript types
    utils/         # Money, date, filters, status helpers
  tests/           # Vitest unit tests
```

## Screenshots

Add screenshots of Dashboard, Transactions, Budgets, Reports, and Goals here after manual QA.

## V1 Definition of Done

- [x] All V1 pages implemented against real Backend API
- [x] No placeholder routes
- [x] RTL + Persian UI
- [x] Loading / Empty / Error states on major pages
- [x] Unit tests for money, date, filters, schemas
- [ ] Run `npm run lint`, `npm run test`, `npm run build` locally before release
