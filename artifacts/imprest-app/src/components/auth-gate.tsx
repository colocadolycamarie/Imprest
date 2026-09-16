import { type ReactNode } from 'react';
import { useSession } from '@/lib/use-session';
import { LoginPage } from '@/pages/login-page';

export function AuthGate({ children }: { children: ReactNode }) {
  const { isLoading, isSignedIn } = useSession();

  if (isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--color-paper)]">
        <div className="mono-data text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">Loading…</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <LoginPage />;
  }

  return <>{children}</>;
}
