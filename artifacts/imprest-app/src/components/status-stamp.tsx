import { AlertTriangle, Check, CircleDollarSign, ClipboardCheck, FileText, X } from 'lucide-react';

const statusStyles: Record<string, { icon: typeof Check; color: string; label: string; dashed?: boolean }> = {
  APPROVED: { icon: Check, color: 'var(--color-positive)', label: 'Approved' },
  REIMBURSED: { icon: CircleDollarSign, color: 'var(--color-info)', label: 'Reimbursed' },
  SUBMITTED: { icon: ClipboardCheck, color: 'var(--color-pending)', label: 'Submitted' },
  IN_REVIEW: { icon: ClipboardCheck, color: 'var(--color-pending)', label: 'In review' },
  // Shares the pending hue with SUBMITTED but always renders with a dashed
  // ring so the two are never confused by color alone — see brief §4.1.
  CHANGES_REQUESTED: { icon: AlertTriangle, color: 'var(--color-pending)', label: 'Changes requested', dashed: true },
  REJECTED: { icon: X, color: 'var(--color-negative)', label: 'Rejected' },
  DRAFT: { icon: FileText, color: 'var(--color-ink-muted)', label: 'Draft' },
};

// Deterministic small tilt per status so the same status always stamps the
// same way, but different statuses don't all lean identically.
const tilt: Record<string, string> = {
  APPROVED: '-1.5deg',
  REIMBURSED: '1deg',
  SUBMITTED: '-2deg',
  IN_REVIEW: '-2deg',
  CHANGES_REQUESTED: '1.5deg',
  REJECTED: '-1deg',
  DRAFT: '0deg',
};

export function StatusStamp({ status }: { status: string }) {
  const key = status.toUpperCase();
  const entry = statusStyles[key] ?? {
    icon: FileText,
    color: 'var(--color-ink-muted)',
    label: status.replaceAll('_', ' '),
  };
  const Icon = entry.icon;
  return (
    <span
      className={`stamp ${entry.dashed ? 'stamp--dashed' : ''}`}
      style={{ color: entry.color, '--stamp-tilt': tilt[key] ?? '0deg' } as React.CSSProperties}
      data-testid={`status-${status.toLowerCase()}`}
    >
      <Icon size={12} strokeWidth={1.75} aria-hidden="true" />
      {entry.label}
    </span>
  );
}
