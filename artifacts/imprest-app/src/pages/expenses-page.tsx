import {
  getGetExpenseQueryKey,
  getListExpensesQueryKey,
  useDeleteExpenseReceipt,
  useGetExpense,
  useListExpenses,
  useSubmitExpense,
  useUpdateExpense,
  useUploadExpenseReceipt,
  type Expense,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Download, Paperclip, Receipt, Save, Send, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { AppShell } from '@/components/app-shell';
import { QuietButton, PrimaryButton } from '@/components/buttons';
import { CounterfoilCard } from '@/components/counterfoil-card';
import { EmptyState, ErrorState, LoadingRows } from '@/components/async-states';
import { FolioNumber } from '@/components/folio-number';
import { Money } from '@/components/money';
import { PageTitle } from '@/components/page-title';
import { SearchField } from '@/components/search-field';
import { StatusStamp } from '@/components/status-stamp';

const STATUS_FILTERS: Array<[string, string]> = [
  ['', 'All records'],
  ['DRAFT', 'Drafts'],
  ['SUBMITTED', 'Submitted'],
  ['APPROVED', 'Approved'],
  ['REIMBURSED', 'Reimbursed'],
  ['REJECTED', 'Rejected'],
];

function ExpenseDetail({ expenseId, onClose }: { expenseId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const detailQuery = useGetExpense(expenseId, { query: { enabled: Boolean(expenseId), queryKey: getGetExpenseQueryKey(expenseId) } });
  const updateMutation = useUpdateExpense();
  const submitMutation = useSubmitExpense();
  const uploadReceiptMutation = useUploadExpenseReceipt();
  const deleteReceiptMutation = useDeleteExpenseReceipt();
  const [draft, setDraft] = useState<Partial<Expense>>({});
  const initializedForId = useRef<string | null>(null);

  useEffect(() => {
    if (detailQuery.data && initializedForId.current !== expenseId) {
      initializedForId.current = expenseId;
      setDraft(detailQuery.data);
    }
  }, [detailQuery.data, expenseId]);

  if (detailQuery.isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(22,21,15,0.4)] sm:items-center">
        <div className="w-full max-w-xl bg-[var(--color-surface)] p-6 shadow-[2px_2px_0_var(--color-line-strong)]">
          <LoadingRows count={4} />
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(22,21,15,0.4)] sm:items-center">
        <div className="w-full max-w-xl bg-[var(--color-surface)] p-6 shadow-[2px_2px_0_var(--color-line-strong)]">
          <ErrorState onRetry={() => detailQuery.refetch()} />
          <button className="mt-4 text-xs font-semibold uppercase text-[var(--color-accent)]" onClick={onClose} type="button">Close detail</button>
        </div>
      </div>
    );
  }

  const expense = detailQuery.data;
  const canEdit = expense.status === 'DRAFT' || expense.status === 'CHANGES_REQUESTED';

  const save = () => {
    updateMutation.mutate(
      {
        id: expense.id,
        data: {
          merchant: draft.merchant,
          category: draft.category,
          amount: Number(draft.amount),
          currency: draft.currency,
          expenseDate: draft.expenseDate,
          description: draft.description,
          costCenter: draft.costCenter ?? null,
        },
      },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetExpenseQueryKey(expense.id), updated);
          queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        },
      },
    );
  };

  const submit = () =>
    submitMutation.mutate(
      { id: expense.id },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetExpenseQueryKey(expense.id), updated);
          queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        },
      },
    );

  const onReceiptFileChosen = (file: File | null) => {
    if (!file) return;
    uploadReceiptMutation.mutate(
      // See note in expense-new-page.tsx: the generated type says `string`
      // because of the node-only tsconfig, but FormData accepts a File.
      { id: expense.id, data: { receipt: file as unknown as string } },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetExpenseQueryKey(expense.id), updated);
          queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        },
      },
    );
  };

  const removeReceipt = () =>
    deleteReceiptMutation.mutate(
      { id: expense.id },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetExpenseQueryKey(expense.id), updated);
          queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        },
      },
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(22,21,15,0.4)] sm:items-center" role="dialog" aria-modal="true" aria-label="Expense detail">
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto bg-[var(--color-surface)] shadow-[2px_2px_0_var(--color-line-strong)]">
        <div className="flex items-start justify-between border-b-2 border-[var(--color-line-strong)] px-5 py-5 md:px-7">
          <div>
            <div className="mono-data text-[10px] uppercase tracking-[0.12em] text-[var(--color-accent)]">Expense / {expense.id.slice(0, 8)}</div>
            <h2 className="mt-2 font-serif text-[30px] leading-none">{expense.merchant}</h2>
          </div>
          <button className="flex h-11 w-11 items-center justify-center border border-[var(--color-line)]" onClick={onClose} type="button" aria-label="Close expense detail" data-testid="button-close-expense-detail">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-5 px-5 py-6 md:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusStamp status={expense.status} />
            <Money amount={expense.amount} currency={expense.currency} className="text-2xl font-semibold" />
          </div>
          {expense.policyFlag ? (
            <div className="border-l-2 border-[var(--color-negative)] bg-[#f7ebe7] px-3 py-2 text-sm text-[var(--color-negative)]">Policy flag: {expense.policyFlag}</div>
          ) : null}
          <div className="border border-[var(--color-line)] p-3">
            <div className="flex items-center gap-3">
              <Paperclip className="shrink-0 text-[var(--color-ink-muted)]" size={16} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {expense.receipt ? (
                  <span className="block truncate text-sm">{expense.receiptFilename ?? 'Receipt attached'}</span>
                ) : (
                  <span className="block text-sm text-[var(--color-ink-muted)]">No receipt attached</span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {expense.receipt ? (
                  <a className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]" href={`/api/expenses/${expense.id}/receipt`} data-testid="link-download-receipt">
                    <Download size={13} aria-hidden="true" /> Download
                  </a>
                ) : null}
                {canEdit ? (
                  <>
                    <label className="inline-flex cursor-pointer items-center text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                      {expense.receipt ? 'Replace' : 'Upload'}
                      <input
                        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                        className="sr-only"
                        disabled={uploadReceiptMutation.isPending}
                        onChange={(event) => {
                          onReceiptFileChosen(event.target.files?.[0] ?? null);
                          event.target.value = '';
                        }}
                        type="file"
                        data-testid="input-detail-receipt-file"
                      />
                    </label>
                    {expense.receipt ? (
                      <button className="text-[var(--color-ink-muted)] hover:text-[var(--color-negative)] disabled:opacity-40" disabled={deleteReceiptMutation.isPending} onClick={removeReceipt} type="button" aria-label="Remove receipt" data-testid="button-remove-detail-receipt">
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
            {uploadReceiptMutation.isError ? (
              <p className="mt-2 text-xs text-[var(--color-negative)]" role="alert">Could not attach that file. Check the format and size, then try again.</p>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(['merchant', 'category', 'costCenter'] as const).map((field) => (
              <label className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-ink-muted)]" key={field}>
                {field === 'costCenter' ? 'Cost center' : field}
                <input
                  className="mt-2 h-11 w-full border border-[var(--color-line)] bg-[var(--color-paper)] px-3 text-sm disabled:opacity-60"
                  disabled={!canEdit}
                  onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))}
                  value={(draft[field] as string | null | undefined) ?? ''}
                  data-testid={`input-detail-${field}`}
                />
              </label>
            ))}
            <label className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-ink-muted)]">
              Amount
              <input
                className="mono-data mt-2 h-11 w-full border border-[var(--color-line)] bg-[var(--color-paper)] px-3 text-right disabled:opacity-60"
                disabled={!canEdit}
                inputMode="decimal"
                min="0"
                onChange={(event) => setDraft((current) => ({ ...current, amount: Number(event.target.value) }))}
                type="number"
                value={draft.amount ?? ''}
                data-testid="input-detail-amount"
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-ink-muted)]">
              Expense date
              <input
                className="mt-2 h-11 w-full border border-[var(--color-line)] bg-[var(--color-paper)] px-3 text-sm disabled:opacity-60"
                disabled={!canEdit}
                onChange={(event) => setDraft((current) => ({ ...current, expenseDate: event.target.value }))}
                type="date"
                value={(draft.expenseDate ?? '').slice(0, 10)}
                data-testid="input-detail-date"
              />
            </label>
          </div>
          <label className="block text-xs font-semibold uppercase tracking-[0.07em] text-[var(--color-ink-muted)]">
            Description
            <textarea
              className="mt-2 min-h-24 w-full resize-y border border-[var(--color-line)] bg-[var(--color-paper)] p-3 text-sm disabled:opacity-60"
              disabled={!canEdit}
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
              value={draft.description ?? ''}
              data-testid="input-detail-description"
            />
          </label>
          <div className="flex flex-col gap-3 border-t border-[var(--color-line)] pt-5 sm:flex-row sm:justify-end">
            <QuietButton disabled={!canEdit || updateMutation.isPending} onClick={save} testId="button-save-expense">
              <Save size={14} /> {updateMutation.isPending ? 'Saving' : 'Save changes'}
            </QuietButton>
            {canEdit ? (
              <PrimaryButton disabled={submitMutation.isPending} onClick={submit} testId="button-submit-detail">
                <Send size={14} /> {submitMutation.isPending ? 'Submitting' : 'Submit for approval'}
              </PrimaryButton>
            ) : null}
          </div>
          {updateMutation.isError || submitMutation.isError ? (
            <p className="text-sm text-[var(--color-negative)]" role="alert">This action did not complete. Check the connection and try again.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ExpensesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const params = useMemo(() => ({ ...(status ? { status } : {}), ...(search ? { search } : {}) }), [search, status]);
  const expensesQuery = useListExpenses(params, { query: { queryKey: getListExpensesQueryKey(params) } });
  const expenses = expensesQuery.data ?? [];

  return (
    <AppShell>
      <PageTitle
        eyebrow="Ledger / all company expenses"
        title="Expense ledger"
        detail="A searchable record of every filing. Select a row to inspect policy context, edit a draft, or submit it for review."
        action={
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] bg-[var(--color-accent)] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-paper)] transition-[background-color,transform] duration-150 hover:bg-[var(--color-accent-hover)] active:scale-[0.98]" href="/expenses/new" data-testid="link-expenses-new">
            <Receipt size={15} aria-hidden="true" /> New expense
          </Link>
        }
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-sm"><SearchField value={search} onChange={setSearch} /></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Expense status filters">
          {STATUS_FILTERS.map(([value, label]) => (
            <button
              className={`min-h-11 rounded-[3px] border px-3 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors duration-150 ${status === value ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-paper)]' : 'border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:border-[var(--color-ink)]'}`}
              key={value}
              onClick={() => setStatus(value)}
              type="button"
              data-testid={`filter-expenses-${value || 'all'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {expensesQuery.isLoading ? (
        <LoadingRows count={7} />
      ) : expensesQuery.isError ? (
        <ErrorState onRetry={() => expensesQuery.refetch()} />
      ) : expenses.length === 0 ? (
        <EmptyState
          title="Nothing filed under this filter."
          detail={search ? `No expenses matched "${search}". Try a broader search.` : 'New drafts and submitted expenses will land here.'}
          action={<Link className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent)]" href="/expenses/new" data-testid="link-empty-new-expense">Create the first expense</Link>}
        />
      ) : (
        <div className="space-y-px border-t-2 border-[var(--color-line-strong)] bg-[var(--color-line)]">
          {expenses.map((expense) => (
            <CounterfoilCard
              amount={expense.amount}
              currency={expense.currency}
              date={expense.expenseDate}
              detail={`${expense.submitter} · ${expense.category}`}
              key={expense.id}
              merchant={expense.merchant}
              onClick={() => setSelectedExpenseId(expense.id)}
              status={expense.status}
              testId={`row-expense-${expense.id}`}
            />
          ))}
        </div>
      )}
      {expenses.length > 0 ? <FolioNumber count={expenses.length} /> : null}
      {selectedExpenseId ? <ExpenseDetail expenseId={selectedExpenseId} onClose={() => setSelectedExpenseId(null)} /> : null}
    </AppShell>
  );
}
