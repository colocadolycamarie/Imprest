import {
  pgTable,
  uuid,
  text,
  numeric,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// Mirrors the status values the frontend renders explicit styling for
// (see components/status-stamp.tsx).
export const expenseStatusEnum = pgEnum("expense_status", [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
  "REIMBURSED",
]);

export const expensesTable = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchant: text("merchant").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  currency: text("currency").notNull().default("USD"),
  expenseDate: date("expense_date").notNull(),
  status: expenseStatusEnum("status").notNull().default("DRAFT"),
  submitterId: uuid("submitter_id")
    .notNull()
    .references(() => usersTable.id),
  receiptFilename: text("receipt_filename"),
  receiptMimeType: text("receipt_mime_type"),
  receiptSizeBytes: numeric("receipt_size_bytes", { mode: "number" }),
  // Relative path under the storage root (see lib/storage.ts). Never expose
  // this directly to clients — always serve receipts through the
  // authenticated /expenses/:id/receipt endpoint.
  receiptStorageKey: text("receipt_storage_key"),
  description: text("description").notNull(),
  // Free-text cost center as entered on the form, e.g. "CC-204 · Product".
  costCenter: text("cost_center"),
  // Parsed from costCenter (or defaulted) so budgets/approvals can group by
  // department without re-parsing a display string on every read.
  department: text("department").notNull().default("General"),
  policyFlag: text("policy_flag"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Expense = typeof expensesTable.$inferSelect;
export type InsertExpense = typeof expensesTable.$inferInsert;
