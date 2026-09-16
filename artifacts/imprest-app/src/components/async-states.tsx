import { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div aria-label="Loading" className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]" data-testid="state-loading">
      {Array.from({ length: count }, (_, index) => (
        <div className="flex min-h-[56px] animate-pulse items-center justify-between gap-4 bg-[var(--color-surface)] px-4" key={index}>
          <div className="h-3 w-1/3 bg-[var(--color-line)]" />
          <div className="h-3 w-20 bg-[var(--color-line)]" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="border-y border-[var(--color-negative)] bg-[var(--color-surface)] px-5 py-8" data-testid="state-error">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 text-[var(--color-negative)]" size={18} aria-hidden="true" />
        <div>
          <p className="font-serif text-lg italic">The ledger could not be reached.</p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Your entries are safe. Try the connection again.</p>
          {onRetry ? (
            <button className="mt-4 min-h-11 rounded-[3px] border border-[var(--color-ink)] px-3 text-xs font-semibold uppercase tracking-[0.08em] transition-[background-color,transform] duration-150 hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] active:scale-[0.98]" onClick={onRetry} type="button" data-testid="button-retry">
              Retry connection
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="border-y border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-12" data-testid="state-empty">
      <p className="font-serif text-xl italic text-[var(--color-ink)]">{title}</p>
      {detail ? <p className="mt-2 max-w-lg text-sm text-[var(--color-ink-muted)]">{detail}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
