import { type ReactNode } from 'react';

export function PageTitle({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 border-b-2 border-[var(--color-line-strong)] pb-5 md:flex-row md:items-end">
      <div>
        <div className="mono-data mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">{eyebrow}</div>
        <h1 className="font-serif text-[38px] leading-none tracking-[-0.04em] md:text-[48px]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-ink-muted)]">{detail}</p>
      </div>
      {action}
    </div>
  );
}
