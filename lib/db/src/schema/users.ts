import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  department: text("department").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
