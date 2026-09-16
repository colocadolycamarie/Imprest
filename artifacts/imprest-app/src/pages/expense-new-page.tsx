import {
  getGetExpenseQueryKey,
  getListExpensesQueryKey,
  useCreateExpense,
  useSubmitExpense,
  useUploadExpenseReceipt,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Paperclip, Save, Send } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AppShell } from '@/components/app-shell';
import { PrimaryButton, QuietButton } from '@/components/buttons';
import { PageTitle } from '@/components/page-title';

const CURRENCIES = [
  ['USD', 'USD — US Dollar'],
  ['CAD', 'CAD — Canadian Dollar'],
  ['EUR', 'EUR — Euro'],
  ['GBP', 'GBP — Pound Sterling'],
] as const;

const CATEGORIES = ['Travel', 'Meals', 'Software', 'Office supplies', 'Client entertainment', 'Other'];
const RECEIPT_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,application/pdf';

export function ExpenseNewPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createMutation = useCreateExpense();
  const submitMutation = useSubmitExpense();
  const uploadReceiptMutation = useUploadExpenseReceipt();
  const [submitAfterSave, setSubmitAfterSave] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    merchant: '',
    category: 'Travel',
    amount: '',
    currency: 'USD',
    expenseDate: new Date().toISOString().slice(0, 10),
    description: '',
    costCenter: '',
  });
  const [formError, setFormError] = useState('');

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const finishNavigatingAway = () => {
    queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
    setLocation('/expenses');
  };

  const saveDraft = (event: FormEvent) => {
    event.preventDefault();
    setFormError('');
    if (!form.merchant.trim() || !form.description.trim() || Number(form.amount) <= 0) {
      setFormError('Add a merchant, description, and amount greater than zero before saving.');
      return;
    }
    createMutation.mutate(
      {
        data: {
          merchant: form.merchant,
          category: form.category,
          amount: Number(form.amount),
          currency: form.currency,
          expenseDate: form.expenseDate,
          description: form.description,
          costCenter: form.costCenter || null,
        },
      },
      {
        onSuccess: (expense) => {
          const afterReceipt = () => {
            queryClient.invalidateQueries({ queryKey: getGetExpenseQueryKey(expense.id) });
            if (submitAfterSave) {
              submitMutation.mutate(
                { id: expense.id },
                {
                  onSuccess: finishNavigatingAway,
                  onError: () => setFormError('Draft saved, but submission could not complete. Open it from the ledger and try again.'),
                },
              );
            } else {
              finishNavigatingAway();
            }
          };

          if (receiptFile) {
            // The receipt type is typed as `string` in the generated client
            // because OpenAPI's binary format needs DOM lib types this
            // node-only package doesn't have configured; FormData accepts a
            // File at runtime regardless of the TS type.
            uploadReceiptMutation.mutate(
              { id: expense.id, data: { receipt: receiptFile as unknown as string } },
              {
                onSuccess: afterReceipt,
                onError: () => setFormError('Draft saved, but the receipt could not be attached. Open it from the ledger and try again.'),
              },
            );
          } else {
            afterReceipt();
          }
        },
        onError: () => setFormError('The draft could not be saved. Check the connection and try again.'),
      },
    );
  };

  return (
    <AppShell>
      <PageTitle
        eyebrow="Capture / new record"
        title="File an expense"
        detail="Keep the record clear enough for the next person in the chain. Receipt and cost-center context reduce review time."
      />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <form className="border-t-2 border-[var(--color-line-strong)] bg-[var(--color-surface)] p-5 md:p-7" onSubmit={saveDraft}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="field-label">Merchant <b>*</b></span>
              <input className="field-input" onChange={(event) => updateField('merchant', event.target.value)} placeholder="e.g. Northstar Rail" value={form.merchant} data-testid="input-merchant" />
            </label>
            <label>
              <span className="field-label">Amount <b>*</b></span>
              <div className="relative">
                <span className="mono-data absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]">$</span>
                <input className="field-input mono-data pl-8 text-right" inputMode="decimal" min="0" onChange={(event) => updateField('amount', event.target.value)} placeholder="0.00" step="0.01" type="number" value={form.amount} data-testid="input-amount" />
              </div>
            </label>
            <label>
              <span className="field-label">Currency</span>
              <select className="field-input" onChange={(event) => updateField('currency', event.target.value)} value={form.currency} data-testid="select-currency">
                {CURRENCIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Category</span>
              <select className="field-input" onChange={(event) => updateField('category', event.target.value)} value={form.category} data-testid="select-category">
                {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>
              <span className="field-label">Expense date</span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" size={16} />
                <input className="field-input" onChange={(event) => updateField('expenseDate', event.target.value)} type="date" value={form.expenseDate} data-testid="input-expense-date" />
              </div>
            </label>
            <label>
              <span className="field-label">Cost center</span>
              <input className="field-input" onChange={(event) => updateField('costCenter', event.target.value)} placeholder="CC-204 / Product" value={form.costCenter} data-testid="input-cost-center" />
            </label>
            <label className="sm:col-span-2">
              <span className="field-label">Description <b>*</b></span>
              <textarea className="field-input min-h-28 resize-y py-3" onChange={(event) => updateField('description', event.target.value)} placeholder="What was this for? Include the project or client context." value={form.description} data-testid="input-description" />
            </label>
            <label className="block sm:col-span-2">
              <span className="field-label">Receipt</span>
              <div className="mt-2 flex items-center gap-3 border border-[var(--color-line)] p-3">
                <Paperclip className="shrink-0 text-[var(--color-ink-muted)]" size={16} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  {receiptFile ? (
                    <span className="block truncate text-sm">{receiptFile.name}</span>
                  ) : (
                    <span className="block text-sm text-[var(--color-ink-muted)]">JPEG, PNG, WEBP, HEIC, or PDF — up to 10MB</span>
                  )}
                </div>
                {receiptFile ? (
                  <button className="shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-ink-muted)] hover:text-[var(--color-negative)]" onClick={() => setReceiptFile(null)} type="button" data-testid="button-remove-receipt">
                    Remove
                  </button>
                ) : (
                  <label className="shrink-0 cursor-pointer text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]">
                    Choose file
                    <input
                      accept={RECEIPT_ACCEPT}
                      className="sr-only"
                      onChange={(event) => setReceiptFile(event.target.files?.[0] ?? null)}
                      type="file"
                      data-testid="input-receipt-file"
                    />
                  </label>
                )}
              </div>
            </label>
          </div>
          {formError ? <p className="mt-5 border-l-2 border-[var(--color-negative)] px-3 py-2 text-sm text-[var(--color-negative)]" role="alert">{formError}</p> : null}
          <div className="mt-7 flex flex-col gap-3 border-t border-[var(--color-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Link className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]" href="/expenses" data-testid="link-cancel-expense">Cancel</Link>
            <div className="flex flex-col gap-2 sm:flex-row">
              <QuietButton disabled={createMutation.isPending || submitMutation.isPending || uploadReceiptMutation.isPending} onClick={() => setSubmitAfterSave(false)} testId="button-save-draft" type="submit">
                <Save size={14} /> {createMutation.isPending && !submitAfterSave ? 'Saving' : 'Save draft'}
              </QuietButton>
              <PrimaryButton disabled={createMutation.isPending || submitMutation.isPending || uploadReceiptMutation.isPending} onClick={() => setSubmitAfterSave(true)} type="submit" testId="button-save-submit">
                <Send size={14} /> {submitMutation.isPending ? 'Submitting' : 'Save & submit'}
              </PrimaryButton>
            </div>
          </div>
        </form>
        <aside className="border-t-2 border-[var(--color-line-strong)] pt-4">
          <div className="mono-data text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">Capture note / 01</div>
          <h2 className="mt-3 font-serif text-[25px] leading-tight italic">Good records travel faster.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-muted)]">A complete description and a cost center give approvers the context they need without a follow-up.</p>
          <div className="mt-8 space-y-3 border-y border-[var(--color-line)] py-4 text-sm">
            <div className="flex gap-3"><span className="mono-data text-[10px] text-[var(--color-accent)]">01</span><span>Enter the transaction as it appears on the receipt.</span></div>
            <div className="flex gap-3"><span className="mono-data text-[10px] text-[var(--color-accent)]">02</span><span>Choose the cost center that owns the spend.</span></div>
            <div className="flex gap-3"><span className="mono-data text-[10px] text-[var(--color-accent)]">03</span><span>Save a draft or send it directly into review.</span></div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
