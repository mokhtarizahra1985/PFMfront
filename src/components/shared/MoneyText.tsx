import { useMoney } from '@/hooks/useMoney';

interface MoneyTextProps {
  amount: number;
  className?: string;
}

export function MoneyText({ amount, className = '' }: MoneyTextProps) {
  const { formatMoney } = useMoney();
  return <span className={className}>{formatMoney(amount)}</span>;
}
