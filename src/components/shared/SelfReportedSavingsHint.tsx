import { SELF_REPORTED_SAVINGS_HINT } from '@/constants/self-reported-savings';

export function SelfReportedSavingsHint({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-slate-500">{SELF_REPORTED_SAVINGS_HINT}</p>
    );
  }

  return (
    <div className="rounded-xl border border-primary-100/80 bg-primary-50/60 px-4 py-3 text-sm text-slate-700">
      <p className="font-medium text-slate-900">پس‌انداز خوداظهاری</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        {SELF_REPORTED_SAVINGS_HINT}
      </p>
    </div>
  );
}
