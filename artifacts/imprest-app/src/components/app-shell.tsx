import { Link, useLocation } from 'wouter';
import {
  BarChart3,
  ClipboardCheck,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCurrentUserQueryKey, useLogout } from '@workspace/api-client-react';
import { useSession } from '@/lib/use-session';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/expenses', label: 'Expenses', icon: ReceiptText },
  { href: '/approvals', label: 'Approvals', icon: ClipboardCheck },
  { href: '/budgets', label: 'Budgets', icon: BarChart3 },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '—';
}

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = navItems.find((item) => item.href === location)?.label ?? 'Imprest';
  const { user } = useSession();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        // setQueryData writes the new value into the cache and *synchronously*
        // notifies every observer subscribed to this exact key — both
        // <AuthGate> and this component's own useSession() call re-render on
        // this same tick. That's what actually flips the UI to signed-out
        // immediately: it doesn't depend on some other query-cache event
        // (removal, invalidation) triggering a background refetch, which is
        // the piece that was previously missing — the cache assumed it was
        // clear, but nothing had told the still-mounted observers to look
        // again, so the app kept rendering the signed-in view until a full
        // page reload forced every query to start over from scratch.
        queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
        // Then drop everything else (expenses, budgets, approvals, …) so
        // cached data from this account can't leak into the next person's
        // session on this device.
        queryClient.removeQueries({
          predicate: (query) => query.queryKey[0] !== getGetCurrentUserQueryKey()[0],
        });
      },
    });
  };

  return (
    <div className="ledger-app min-h-[100dvh] md:flex">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {/* Pinned to the viewport height and scrolls its own overflow (if any)
          instead of stretching to match the main column's content height —
          previously a long main column (e.g. a big expenses list) forced
          this whole sidebar to grow with it, pushing the user/logout block
          off-screen and making you scroll the entire page to reach it. */}
      <aside className="sticky top-0 hidden h-[100dvh] w-[236px] shrink-0 flex-col overflow-y-auto bg-[var(--color-ink)] text-[var(--color-paper)] md:flex">
        <div className="border-b border-[rgba(247,245,239,0.18)] px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5" data-testid="link-brand">
            <img alt="" aria-hidden="true" className="h-[26px] w-[26px] shrink-0" height={26} src="/logo.png" width={26} />
            <div className="font-serif text-[22px] leading-none tracking-[-0.02em]">Imprest</div>
          </Link>
        </div>
        <div className="px-4 pt-7">
          <nav aria-label="Primary navigation" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location === item.href;
              return (
                <Link
                  className={`flex items-center gap-3 border-l-2 px-2 py-2.5 text-sm ${active ? 'border-[var(--color-accent)] text-[var(--color-paper)]' : 'border-transparent text-[#aaa79b] hover:text-[var(--color-paper)]'}`}
                  href={item.href}
                  key={item.href}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-[rgba(247,245,239,0.18)] px-6 py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-[var(--color-paper)]">{user ? initials(user.name) : '—'}</div>
              <div className="min-w-0">
                <div className="truncate text-sm">{user?.name ?? 'Loading…'}</div>
                <div className="truncate text-[11px] text-[#aaa79b]">{user?.department ?? ''}</div>
              </div>
            </div>
            <button className="flex h-8 w-8 shrink-0 items-center justify-center text-[#aaa79b] hover:text-[var(--color-paper)] disabled:opacity-40" disabled={logoutMutation.isPending} onClick={handleLogout} type="button" aria-label="Sign out" data-testid="button-logout">
              <LogOut size={15} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-line)] bg-[rgba(247,245,239,0.96)] px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button className="inline-flex h-11 w-11 items-center justify-center border border-[var(--color-line)] md:hidden" onClick={() => setMobileOpen((value) => !value)} type="button" aria-label="Open navigation" data-testid="button-mobile-menu">
              <Menu size={18} />
            </button>
            <div className="mono-data text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">{current}</div>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-[3px] border border-[var(--color-accent)] px-3 py-2 text-xs font-semibold text-[var(--color-accent)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] active:scale-[0.98]" href="/expenses/new" data-testid="link-new-expense-header">
            <FilePlus2 size={15} strokeWidth={1.5} aria-hidden="true" />
            <span>New expense</span>
          </Link>
        </header>
        {mobileOpen ? (
          <div className="border-b border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 md:hidden">
            <nav aria-label="Mobile navigation" className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link className="flex min-h-11 items-center gap-2 border border-[var(--color-line)] px-3 text-sm" href={item.href} key={item.href} onClick={() => setMobileOpen(false)} data-testid={`link-mobile-${item.label.toLowerCase()}`}>
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
        <main id="main-content" className="page-enter mx-auto max-w-[1440px] px-4 py-7 pb-24 md:px-8 md:py-10 md:pb-10">{children}</main>
      </div>

      <nav aria-label="Mobile tab navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[var(--color-line)] bg-[var(--color-surface)] md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link className={`flex min-h-16 flex-col items-center justify-center gap-1 border-t-2 text-[10px] ${active ? 'border-[var(--color-accent)] text-[var(--color-accent)]' : 'border-transparent text-[var(--color-ink-muted)]'}`} href={item.href} key={item.href} data-testid={`link-bottom-${item.label.toLowerCase()}`}>
              <Icon size={17} strokeWidth={1.5} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}