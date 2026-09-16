import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { type ReactNode } from 'react';

export function ButtonArrow({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Link className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]" href={href} data-testid={`link-${href.replaceAll('/', '-').replace(/^-/, '')}`}>
      {children}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}
