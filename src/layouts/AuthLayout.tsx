import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600/10 text-2xl ring-1 ring-primary-500/20">
            💰
          </div>
          <h1 className="text-2xl font-bold text-slate-900">مدیریت مالی شخصی</h1>
          <p className="mt-2 text-sm text-slate-600">
            کنترل درآمد، هزینه و پس‌انداز در یک جا
          </p>
        </div>
        <div className="auth-panel">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
