import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--color-paper)] p-6">
      <div className="w-full max-w-md border-t-2 border-[var(--color-line-strong)] pt-6 text-center">
        <AlertCircle className="mx-auto text-[var(--color-negative)]" size={28} strokeWidth={1.5} aria-hidden="true" />
        <div className="mono-data mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-negative)]">
          404 / Not found
        </div>
        <h1 className="mt-2 font-serif text-2xl text-[var(--color-ink)]">This page isn't in the ledger.</h1>
        <p className="mt-3 text-sm text-[var(--color-ink-muted)]">The link may be out of date, or the page may have moved.</p>
        <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[3px] bg-[var(--color-ink)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-paper)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-accent)] active:scale-[0.98]" href="/" data-testid="link-not-found-home">
          Return to overview
        </Link>
      </div>
    </div>
  );
}
