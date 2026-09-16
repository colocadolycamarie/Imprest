import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { expensesTable } from "./expenses";

export const approvalDecisionEnum = pgEnum("approval_decision", [
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
]);

export const approvalsTable = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expensesTable.id),
  department: text("department").notNull(),
  submittedAt: timestamp("submitted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  // SLA deadline, set when the approval is created; the API derives the
  // human-readable "Due in N days" string from this at read time.
  dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
  // Null while the item is still sitting in the open queue.
  decision: approvalDecisionEnum("decision"),
  comment: text("comment"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export type Approval = typeof approvalsTable.$inferSelect;
export type InsertApproval = typeof approvalsTable.$inferInsert;
