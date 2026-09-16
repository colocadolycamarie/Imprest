import { pgTable, uuid, text, numeric } from "drizzle-orm/pg-core";

export const budgetsTable = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  department: text("department").notNull(),
  limitAmount: numeric("limit_amount", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).notNull(),
  period: text("period").notNull(),
});

export type Budget = typeof budgetsTable.$inferSelect;
export type InsertBudget = typeof budgetsTable.$inferInsert;
