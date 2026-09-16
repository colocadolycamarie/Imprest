import { type ReactNode } from 'react';

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = 'button',
  testId = 'button-primary',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  testId?: string;
}) {
  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] bg-[var(--color-accent)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-paper)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[var(--color-ink-muted)] disabled:opacity-50 disabled:active:scale-100"
      disabled={disabled}
      onClick={onClick}
      type={type}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

export function QuietButton({
  children,
  disabled,
  onClick,
  testId,
  type = 'button',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  testId: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] border border-[var(--color-line)] bg-[var(--color-surface)] px-3 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-ink)] transition-[border-color,transform] duration-150 hover:border-[var(--color-ink)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
      disabled={disabled}
      onClick={onClick}
      type={type}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

/** Lowest-emphasis tier — inline text actions (promo-code-style "matters least" affordances). */
export function GhostButton({
  children,
  disabled,
  onClick,
  testId,
  type = 'button',
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  testId: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-muted)] transition-colors duration-150 hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type={type}
      data-testid={testId}
    >
      {children}
    </button>
  );
}
