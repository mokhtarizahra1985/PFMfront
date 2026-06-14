import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/hooks/useSettings';
import {
  DesktopSidebar,
  MobileBottomNavigation,
  MobileDrawerNav,
} from '@/components/layout/Navigation';

export function AppLayout() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  useSettings();

  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />
      <MobileDrawerNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="glass-bar sticky top-0 z-30 border-b">
          <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200/70 bg-surface/80 px-3 py-2 text-sm lg:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="باز کردن منو"
              >
                ☰
              </button>
              <div>
                <p className="text-sm text-slate-500">خوش آمدید</p>
                <p className="font-semibold text-slate-900">
                  {user?.firstName ?? 'کاربر'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/app/transactions/new"
                className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                + تراکنش
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-200/70 bg-surface/80 px-4 py-2 text-sm text-slate-700 hover:bg-surface"
              >
                خروج
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 lg:px-6 lg:pb-6">
          <Outlet />
        </main>

        <MobileBottomNavigation />
      </div>
    </div>
  );
}
