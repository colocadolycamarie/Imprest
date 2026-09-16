import { getListBudgetsQueryKey, useListBudgets, type Budget } from '@workspace/api-client-react';
import { useMemo } from 'react';
import { AppShell } from '@/components/app-shell';
import { FloatRing } from '@/components/float-ring';
import { FolioNumber } from '@/components/folio-number';
import { EmptyState, ErrorState, LoadingRows } from '@/components/async-states';
import { PageTitle } from '@/components/page-title';
import { SectionHeader } from '@/components/section-header';

export function BudgetsPage() {
  const budgetsQuery = useListBudgets({ query: { queryKey: getListBudgetsQueryKey() } });
  const budgets = budgetsQuery.data ?? [];
  const grouped = useMemo(
    () =>
      budgets.reduce<Record<string, Budget[]>>((accumulator, budget) => {
        (accumulator[budget.department] ??= []).push(budget);
        return accumulator;
      }, {}),
    [budgets],
  );

  return (
    <AppShell>
      <PageTitle
        eyebrow="Control / department allocation"
        title="Budgets"
        detail="Each ring fills clockwise from the top — the float against its published limit. The ring changes color as a department gets close to the line."
      />
      {budgetsQuery.isLoading ? (
        <LoadingRows count={6} />
      ) : budgetsQuery.isError ? (
        <ErrorState onRetry={() => budgetsQuery.refetch()} />
      ) : budgets.length === 0 ? (
        <EmptyState title="No budget lines have been published." detail="Once departments receive an allocation, finance can watch consumption here." />
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([department, entries]) => (
            <section key={department}>
              <SectionHeader eyebrow={`Department / ${department}`} title={`${department} allocation`} detail={`${entries.length} active budget ${entries.length === 1 ? 'line' : 'lines'}`} />
              <div className="grid grid-cols-1 gap-px border-t-2 border-[var(--color-line-strong)] bg-[var(--color-line)] sm:grid-cols-2 xl:grid-cols-3">
                {entries.map((budget) => (
                  <div className="bg-[var(--color-surface)] px-5 py-6" key={budget.id} data-testid={`row-budget-${budget.id}`}>
                    <div className="mb-1 font-serif text-[19px] leading-tight">{budget.name}</div>
                    <div className="mono-data mb-4 text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">{budget.period}</div>
                    <FloatRing limit={budget.limit} spent={budget.spent} />
                  </div>
                ))}
              </div>
            </section>
          ))}
          <FolioNumber count={budgets.length} perPage={999} />
        </div>
      )}
    </AppShell>
  );
}
