const RECEIPT_REQUIRED_THRESHOLD = 250;
const APPROVAL_SLA_DAYS = 3;

/** Cost centers are entered freeform, e.g. "CC-204 · Product" or
 * "CC-310 / Sales". Department is parsed out for budget/approval grouping,
 * defaulting to "General" when nothing usable was entered. */
export function deriveDepartment(costCenter: string | null | undefined): string {
  if (!costCenter) return "General";
  const [, department] = costCenter.split(/[·/]/);
  return department?.trim() || "General";
}

export function derivePolicyFlag(amount: number, receipt: boolean): string | null {
  return amount > RECEIPT_REQUIRED_THRESHOLD && !receipt
    ? `Receipt required above $${RECEIPT_REQUIRED_THRESHOLD}`
    : null;
}

export function approvalDueDate(from: Date = new Date()): Date {
  const due = new Date(from);
  due.setDate(due.getDate() + APPROVAL_SLA_DAYS);
  return due;
}

/** Human-readable SLA countdown, computed fresh on every read so it never
 * goes stale between the DB write and the response. */
export function describeSla(dueAt: Date, now: Date = new Date()): string {
  const days = Math.ceil((dueAt.getTime() - now.getTime()) / 86_400_000);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}
