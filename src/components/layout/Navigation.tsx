import { NavLink } from 'react-router-dom';

const primaryNav = [
  { to: '/app/dashboard', label: 'داشبورد', icon: '🏠' },
  { to: '/app/transactions', label: 'تراکنش‌ها', icon: '📋' },
  { to: '/app/budgets', label: 'بودجه', icon: '📊' },
  { to: '/app/reports', label: 'گزارش‌ها', icon: '📈' },
  { to: '/app/goals', label: 'اهداف', icon: '🎯' },
];

const secondaryNav = [
  { to: '/app/recurring', label: 'درآمد/هزینه ثابت', icon: '🔁' },
  { to: '/app/accounts', label: 'حساب‌ها', icon: '💳' },
  { to: '/app/categories', label: 'دسته‌بندی‌ها', icon: '🏷️' },
  { to: '/app/settings', label: 'تنظیمات', icon: '⚙️' },
];

function navClassName(isActive: boolean): string {
  return [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/25'
      : 'text-slate-700 hover:bg-surface hover:text-slate-900',
  ].join(' ');
}

export function DesktopSidebar() {
  return (
    <aside className="glass-bar hidden w-64 shrink-0 border-l lg:block">
      <div className="border-b border-slate-200/60 px-5 py-6">
        <p className="text-lg font-bold text-slate-900">مدیریت مالی</p>
        <p className="text-xs text-slate-500">نسخه ۱</p>
      </div>
      <nav className="space-y-6 p-4">
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app/dashboard' || item.to === '/app/budgets' || item.to === '/app/reports' || item.to === '/app/goals'}
              className={({ isActive }) => navClassName(isActive)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div>
          <p className="mb-2 px-3 text-xs font-semibold text-slate-400">بیشتر</p>
          <div className="space-y-1">
            {secondaryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => navClassName(isActive)}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export function MobileBottomNavigation() {
  const mobileNav = primaryNav.slice(0, 4);

  return (
    <nav className="glass-bar fixed inset-x-0 bottom-0 z-40 border-t px-2 py-2 lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center rounded-xl px-1 py-2 text-[11px] font-medium',
                isActive ? 'text-primary-600' : 'text-slate-600',
              ].join(' ')
            }
          >
            <span className="text-lg" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            [
              'flex flex-col items-center rounded-xl px-1 py-2 text-[11px] font-medium',
              isActive ? 'text-primary-600' : 'text-slate-600',
            ].join(' ')
          }
        >
          <span className="text-lg" aria-hidden="true">
            ⚙️
          </span>
          <span>تنظیمات</span>
        </NavLink>
      </div>
    </nav>
  );
}

export function MobileDrawerNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="بستن منو"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="glass-bar absolute inset-y-0 right-0 w-72 border-l p-4 shadow-xl shadow-slate-900/10">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-bold text-slate-900">منو</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            بستن
          </button>
        </div>
        <div className="space-y-1">
          {[...primaryNav, ...secondaryNav].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={
                item.to === '/app/dashboard' ||
                item.to === '/app/budgets' ||
                item.to === '/app/reports' ||
                item.to === '/app/goals' ||
                item.to === '/app/recurring' ||
                item.to === '/app/accounts' ||
                item.to === '/app/categories' ||
                item.to === '/app/settings'
              }
              onClick={onClose}
              className={({ isActive }) => navClassName(isActive)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}
