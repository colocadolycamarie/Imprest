import { formatMoney } from '@/lib/format';

export function Money({
  amount,
  currency = 'USD',
  className = '',
}: {
  amount: number;
  currency?: string;
  className?: string;
}) {
  return <span className={`mono-data ${className}`}>{formatMoney(amount, currency)}</span>;
}
