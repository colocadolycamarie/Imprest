import { type ReactNode } from 'react';

export function MetricRow({
  label,
  value,
  detail,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: 'default' | 'positive' | 'pending' | 'negative';
}) {
  const color = tone === 'positive' ? 'var(--color-positive)' : tone === 'pending' ? 'var(--color-pending)' : tone === 'negative' ? 'var(--color-negative)' : 'var(--color-ink)';
  return (
    <div className="flex items-baseline justify-between gap-5 border-b border-[var(--color-line)] py-3.5 last:border-b-0" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>
      <div>
        <div className="text-sm text-[var(--color-ink-muted)]">{label}</div>
        {detail ? <div className="mono-data mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">{detail}</div> : null}
      </div>
      <div className="mono-data text-right text-[20px] font-semibold" style={{ color }}>{value}</div>
    </div>
  );
}
