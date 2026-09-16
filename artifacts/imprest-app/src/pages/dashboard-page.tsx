import {
  getGetDashboardSummaryQueryKey,
  getListBudgetsQueryKey,
  useGetDashboardSummary,
  useListBudgets,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowDownLeft, ArrowUpRight, Receipt } from 'lucide-react';
import { Link } from 'wouter';
import { AppShell } from '@/components/app-shell';
import { FloatRing } from '@/components/float-ring';
import { ButtonArrow } from '@/components/button-arrow';
import { EmptyState, ErrorState, LoadingRows } from '@/components/async-states';
import { Money } from '@/components/money';
import { MetricRow } from '@/components/metric-row';
import { PageTitle } from '@/components/page-title';
import { SectionHeader } from '@/components/section-header';
import { formatRelative } from '@/lib/format';
import { useSession } from '@/lib/use-session';

export function DashboardPage() {
  const { user } = useSession();
  const firstName = user?.name.split(' ')[0] ?? '';
  const queryClient = useQueryClient();
  const summaryQuery = useGetDashboardSummary({ query: { queryKey: getGetDashboardSummaryQueryKey() } });
  const budgetsQuery = useListBudgets({ query: { queryKey: getListBudgetsQueryKey() } });
  const summary = summaryQuery.data;
  const budgets = budgetsQuery.data ?? [];

  return (
    <AppShell>
      <PageTitle
        eyebrow={`Imprest / ${user?.department ?? ''}`}
        title={`Good morning, ${firstName || 'there'}.`}
        detail="Your monthly control surface. Review what moved, what is waiting, and where the company is running hot."
        action={
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] border border-[var(--color-accent)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-accent)] hover:text-[var(--color-paper)] active:scale-[0.98]" href="/expenses/new" data-testid="link-dashboard-new-expense">
            <Receipt size={15} aria-hidden="true" /> File an expense
          </Link>
        }
      />

      {summaryQuery.isLoading ? (
        <LoadingRows count={3} />
      ) : summaryQuery.isError ? (
        <ErrorState onRetry={() => summaryQuery.refetch()} />
      ) : summary ? (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
          <div className="space-y-8">
            <section className="stagger-in">
              <SectionHeader eyebrow="Month to date / USD" title="The month at a glance" detail="Compared with the previous 30-day period." />
              <div className="border-y border-[var(--color-line)] bg-[var(--color-surface)] px-4">
                <MetricRow label="Company spend" value={<Money amount={summary.monthToDate} />} detail={summary.monthlyChange >= 0 ? `+${summary.monthlyChange}% vs last month` : `${summary.monthlyChange}% vs last month`} tone={summary.monthlyChange > 8 ? 'pending' : 'default'} />
                <MetricRow label="Awaiting review" value={summary.pendingReview} detail="items across all departments" tone="pending" />
                <MetricRow label="Reimbursed" value={<Money amount={summary.reimbursed} />} detail="settled this month" tone="positive" />
                <MetricRow label="Policy exceptions" value={summary.policyExceptions} detail="need finance attention" tone={summary.policyExceptions > 0 ? 'negative' : 'positive'} />
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                {summary.monthlyChange >= 0 ? <ArrowUpRight size={14} className="text-[var(--color-pending)]" aria-hidden="true" /> : <ArrowDownLeft size={14} className="text-[var(--color-positive)]" aria-hidden="true" />}
                <span>Spend is {Math.abs(summary.monthlyChange)}% {summary.monthlyChange >= 0 ? 'above' : 'below'} the prior month.</span>
              </div>
            </section>

            <section className="stagger-in">
              <SectionHeader eyebrow="Activity / live audit trail" title="Recent movement" detail="The last actions recorded in your workspace." action={<ButtonArrow href="/expenses">Open expense ledger</ButtonArrow>} />
              {summary.recentActivity.length === 0 ? (
                <EmptyState title="Nothing has moved yet this month." detail="New submissions and approval decisions will appear here." />
              ) : (
                <div className="border-t border-[var(--color-line)]">
                  {summary.recentActivity.map((item) => (
                    <div className="ledger-row flex items-center justify-between gap-5 px-4 py-3.5" key={item.id} data-testid={`activity-${item.id}`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span className={`h-1.5 w-1.5 ${item.tone === 'negative' ? 'bg-[var(--color-negative)]' : item.tone === 'positive' ? 'bg-[var(--color-positive)]' : 'bg-[var(--color-accent)]'}`} />
                          {item.label}
                        </div>
                        <div className="mt-1 truncate text-xs text-[var(--color-ink-muted)]">{item.detail}</div>
                      </div>
                      <div className="mono-data shrink-0 text-[10px] uppercase text-[var(--color-ink-muted)]">{formatRelative(item.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section className="stagger-in">
              <SectionHeader eyebrow="Budget watch / current periods" title="Where the line is moving" detail="Live spend against each department's allocation." />
              {budgetsQuery.isLoading ? (
                <LoadingRows count={3} />
              ) : budgetsQuery.isError ? (
                <ErrorState onRetry={() => queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() })} />
              ) : budgets.length === 0 ? (
                <EmptyState title="No budgets have been set." detail="Department allocations will surface here once finance publishes the next period." action={<ButtonArrow href="/budgets">Review budgets</ButtonArrow>} />
              ) : (
                <div className="border-y border-[var(--color-line)] bg-[var(--color-surface)]">
                  {budgets.slice(0, 4).map((budget) => (
                    <div className="border-b border-[var(--color-line)] px-4 py-5 last:border-b-0" key={budget.id} data-testid={`budget-preview-${budget.id}`}>
                      <div className="mono-data mb-3 text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">{budget.name} — {budget.department} / {budget.period}</div>
                      <FloatRing limit={budget.limit} size={72} spent={budget.spent} stroke={6} />
                    </div>
                  ))}
                  <div className="px-4 py-3"><ButtonArrow href="/budgets">View all budgets</ButtonArrow></div>
                </div>
              )}
            </section>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
