import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MoneyText } from '@/components/shared/MoneyText';

type StatTone = 'default' | 'income' | 'expense' | 'neutral';

interface StatCardProps {
  title: string;
  amount?: number;
  subtitle?: string;
  tone?: StatTone;
  href?: string;
  children?: ReactNode;
}

const toneClasses: Record<StatTone, string> = {
  default: 'text-slate-900',
  income: 'text-green-700',
  expense: 'text-red-700',
  neutral: 'text-slate-700',
};

export function StatCard({
  title,
  amount,
  subtitle,
  tone = 'default',
  href,
  children,
}: StatCardProps) {
  const content = (
    <>
      <p className="text-sm text-slate-500">{title}</p>
      {amount !== undefined ? (
        <p className={`mt-2 text-2xl font-bold ${toneClasses[tone]}`}>
          <MoneyText amount={amount} />
        </p>
      ) : (
        children
      )}
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
    </>
  );

  const className =
    'surface-card block p-5 transition hover:border-primary-200/80 hover:shadow-md';

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
