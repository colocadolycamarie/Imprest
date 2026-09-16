import { Search } from 'lucide-react';

export function SearchField({
  value,
  onChange,
  placeholder = 'Search ledger',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" size={16} aria-hidden="true" />
      <input className="h-11 w-full border border-[var(--color-line)] bg-[var(--color-surface)] pl-10 pr-3 text-sm placeholder:text-[var(--color-ink-muted)]" onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="search" value={value} data-testid="input-search" />
    </label>
  );
}
