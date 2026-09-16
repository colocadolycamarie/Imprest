import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { expensesTable } from "./expenses";

export const activityToneEnum = pgEnum("activity_tone", [
  "positive",
  "negative",
  "pending",
]);

export const activityLogTable = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  label: text("label").notNull(),
  detail: text("detail").notNull(),
  tone: activityToneEnum("tone").notNull().default("pending"),
  expenseId: uuid("expense_id").references(() => expensesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type ActivityLogEntry = typeof activityLogTable.$inferSelect;
export type InsertActivityLogEntry = typeof activityLogTable.$inferInsert;
