import { formatMoney } from '@/lib/format';

/**
 * The Float Ring — Imprest's one recurring shape for "a quantity against a
 * boundary." Fills clockwise from 12 o'clock (the "reconciliation mark").
 * Used for budget consumption here; also used inline for approval-SLA
 * countdowns on the Approvals queue. See design brief §6.4.
 */
export function FloatRing({
  spent,
  limit,
  size = 96,
  stroke = 8,
  currency,
}: {
  spent: number;
  limit: number;
  size?: number;
  stroke?: number;
  currency?: string;
}) {
  const percentage = limit > 0 ? Math.min(100, Math.max(0, (spent / limit) * 100)) : 0;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);
  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
  const color = pct >= 100 ? 'var(--color-negative)' : pct >= 80 ? 'var(--color-pending)' : 'var(--color-brass)';

  return (
    <div className="inline-flex items-center gap-4">
      <svg className="float-ring shrink-0" height={size} width={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${pct}% of budget consumed`}>
        <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke="var(--color-line)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          fill="none"
          r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          className="mono-data"
          dominantBaseline="middle"
          fill="var(--color-ink)"
          fontSize={size * 0.16}
          fontWeight={600}
          textAnchor="middle"
          x="50%"
          y="50%"
        >
          {pct}%
        </text>
      </svg>
      <div>
        <div className="mono-data text-sm font-semibold" style={{ color }}>
          {formatMoney(spent, currency)} <span className="text-[var(--color-ink-muted)] font-normal">/ {formatMoney(limit, currency)}</span>
        </div>
        <div className="mono-data mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
          {formatMoney(Math.max(0, limit - spent), currency)} remaining
        </div>
      </div>
    </div>
  );
}

/** Compact inline variant for dense rows — e.g. Approvals queue SLA marker. */
export function FloatRingInline({ percentage, size = 28, stroke = 3.5 }: { percentage: number; size?: number; stroke?: number }) {
  const pct = Math.min(100, Math.max(0, percentage));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const color = pct >= 100 ? 'var(--color-negative)' : pct >= 75 ? 'var(--color-pending)' : 'var(--color-brass)';
  return (
    <svg className="float-ring shrink-0" height={size} width={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} fill="none" r={radius} stroke="var(--color-line)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        fill="none"
        r={radius}
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth={stroke}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
