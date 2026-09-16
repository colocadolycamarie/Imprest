import { type ReactNode } from 'react';
import { Money } from '@/components/money';
import { StatusStamp } from '@/components/status-stamp';
import { formatDate } from '@/lib/format';

/**
 * The Counterfoil — Imprest's signature component. Every expense record
 * renders as a torn chequebook stub: a record half (merchant, date, amount)
 * divided by a perforated edge from an action/status half. See design
 * brief §6.2.
 */
export function CounterfoilCard({
  merchant,
  detail,
  amount,
  currency,
  date,
  status,
  onClick,
  testId,
}: {
  merchant: string;
  detail?: ReactNode;
  amount: number;
  currency?: string;
  date?: string;
  status: string;
  onClick?: () => void;
  testId?: string;
}) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      className="counterfoil w-full px-4 py-4 text-left"
      onClick={onClick}
      type={onClick ? 'button' : undefined}
      data-testid={testId}
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-serif text-[19px] leading-none">{merchant}</span>
          {date ? <span className="mono-data shrink-0 text-[10px] text-[var(--color-ink-muted)]">{formatDate(date)}</span> : null}
        </div>
        {detail ? <div className="mt-1.5 truncate text-xs text-[var(--color-ink-muted)]">{detail}</div> : null}
        <div className="mono-data mt-1.5 text-[15px] font-semibold">
          <Money amount={amount} currency={currency} />
        </div>
      </div>
      <div className="pl-4">
        <StatusStamp status={status} />
      </div>
    </Wrapper>
  );
}
