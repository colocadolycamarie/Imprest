import { type ReactNode } from 'react';

export function SectionHeader({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-rule mb-5 flex items-end justify-between gap-4 pb-3">
      <div>
        <div className="mono-data mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          {eyebrow}
        </div>
        <h2 className="font-serif text-[26px] leading-tight tracking-[-0.025em] text-[var(--color-ink)]">{title}</h2>
        {detail ? <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{detail}</p> : null}
      </div>
      {action}
    </div>
  );
}
