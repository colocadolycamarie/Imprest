import {
  ApprovalDecisionInputDecision,
  getGetDashboardSummaryQueryKey,
  getListApprovalsQueryKey,
  useDecideApproval,
  useListApprovals,
  type ApprovalItem,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { ButtonArrow } from '@/components/button-arrow';
import { EmptyState, ErrorState, LoadingRows } from '@/components/async-states';
import { FolioNumber } from '@/components/folio-number';
import { Money } from '@/components/money';
import { PageTitle } from '@/components/page-title';
import { formatDate } from '@/lib/format';

type Decision = (typeof ApprovalDecisionInputDecision)[keyof typeof ApprovalDecisionInputDecision];

function ApprovalRow({
  item,
  onDecision,
  working,
}: {
  item: ApprovalItem;
  onDecision: (item: ApprovalItem, decision: Decision) => void;
  working: boolean;
}) {
  return (
    <div className={`ledger-row grid gap-4 px-4 py-4 lg:grid-cols-[minmax(220px,1.4fr)_0.8fr_0.7fr_0.8fr_1fr] lg:items-center ${working ? 'approval-wash' : ''}`} data-testid={`row-approval-${item.id}`}>
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {item.merchant}
          <span className="mono-data text-[10px] font-normal text-[var(--color-ink-muted)]">#{item.expenseId.slice(0, 6)}</span>
        </div>
        <div className="mt-1 text-xs text-[var(--color-ink-muted)]">{item.submitter} · {item.department}</div>
      </div>
      <div>
        <div className="mono-data text-sm font-semibold"><Money amount={item.amount} currency={item.currency} /></div>
        <div className="mt-1 text-xs text-[var(--color-ink-muted)]">{item.category}</div>
      </div>
      <div>
        <div className="mono-data text-xs">{formatDate(item.submittedAt)}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">submitted</div>
      </div>
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-[3px] border border-[var(--color-pending)] bg-[color-mix(in_srgb,var(--color-pending)_8%,transparent)] px-2 py-1">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-pending)]" aria-hidden="true" />
          <span className="mono-data text-xs font-semibold text-[var(--color-pending)]">{item.sla}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <button className="inline-flex min-h-11 items-center gap-1.5 rounded-[3px] border border-[var(--color-positive)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-positive)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-positive)] hover:text-[var(--color-paper)] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100" disabled={working} onClick={() => onDecision(item, ApprovalDecisionInputDecision.APPROVED)} type="button" data-testid={`button-approve-${item.id}`}>
          <Check size={13} /> Approve
        </button>
        <button className="inline-flex min-h-11 items-center gap-1.5 rounded-[3px] border border-[var(--color-pending)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-pending)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-pending)] hover:text-[var(--color-paper)] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100" disabled={working} onClick={() => onDecision(item, ApprovalDecisionInputDecision.CHANGES_REQUESTED)} type="button" data-testid={`button-changes-${item.id}`}>
          Request changes
        </button>
        <button className="inline-flex min-h-11 items-center gap-1.5 rounded-[3px] border border-[var(--color-negative)] px-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--color-negative)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-negative)] hover:text-[var(--color-paper)] active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100" disabled={working} onClick={() => onDecision(item, ApprovalDecisionInputDecision.REJECTED)} type="button" data-testid={`button-reject-${item.id}`}>
          <X size={13} /> Reject
        </button>
      </div>
    </div>
  );
}

export function ApprovalsPage() {
  const queryClient = useQueryClient();
  const approvalsQuery = useListApprovals({ query: { queryKey: getListApprovalsQueryKey() } });
  const decideMutation = useDecideApproval();
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState('');
  const approvals = approvalsQuery.data ?? [];

  const handleDecision = (item: ApprovalItem, decision: Decision) => {
    setWorkingId(item.id);
    setDecisionError('');
    decideMutation.mutate(
      {
        id: item.id,
        data: {
          decision,
          comment:
            decision === ApprovalDecisionInputDecision.APPROVED
              ? null
              : decision === ApprovalDecisionInputDecision.REJECTED
                ? 'Rejected during finance review.'
                : 'Please add the missing context and resubmit.',
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListApprovalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setWorkingId(null);
        },
        onError: () => {
          setDecisionError('The decision did not reach the ledger. Keep this row open and try again.');
          setWorkingId(null);
        },
      },
    );
  };

  return (
    <AppShell>
      <PageTitle
        eyebrow="Review / manager queue"
        title="Approval queue"
        detail="Read the signal, make the call, and keep the reimbursement clock intact."
        action={
          <div className="mono-data text-right text-xs text-[var(--color-ink-muted)]">
            <span className="block text-[28px] font-semibold text-[var(--color-ink)]">{approvals.length.toString().padStart(2, '0')}</span>
            open items
          </div>
        }
      />
      {decisionError ? (
        <div className="mb-5 border-l-2 border-[var(--color-negative)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-negative)]" role="alert">{decisionError}</div>
      ) : null}
      <div className="mb-5 mono-data text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Sorted by SLA urgency — soonest due first</div>
      {approvalsQuery.isLoading ? (
        <LoadingRows count={5} />
      ) : approvalsQuery.isError ? (
        <ErrorState onRetry={() => approvalsQuery.refetch()} />
      ) : approvals.length === 0 ? (
        <EmptyState title="The queue is clear." detail="No decisions are waiting for you. A quiet review surface is a good one." action={<ButtonArrow href="/expenses">Return to ledger</ButtonArrow>} />
      ) : (
        <div className="border-t-2 border-[var(--color-line-strong)]">
          {approvals.map((item) => (
            <ApprovalRow item={item} key={item.id} onDecision={handleDecision} working={workingId === item.id} />
          ))}
        </div>
      )}
      {approvals.length > 0 ? <FolioNumber count={approvals.length} /> : null}
    </AppShell>
  );
}
