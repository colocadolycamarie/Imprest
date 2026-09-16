/**
 * Dev-only convenience seed. Not imported by the API server and never runs
 * automatically — invoke explicitly with `pnpm --filter @workspace/db run seed`
 * against a local/dev DATABASE_URL when you want sample rows to develop against.
 * Safe to re-run: it checks for existing rows before inserting.
 */
import { db, pool } from "./index";
import { hashPassword } from "./auth";
import { usersTable, budgetsTable } from "./schema";

const DEMO_PASSWORD = "imprest-demo";

async function seed() {
  const existingUsers = await db.select().from(usersTable).limit(1);
  if (existingUsers.length > 0) {
    console.log("Seed skipped: users table is not empty.");
    return;
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const [maya] = await db
    .insert(usersTable)
    .values([
      { name: "Maya Chen", email: "maya.chen@example.com", passwordHash, department: "Product" },
      { name: "Jon Bell", email: "jon.bell@example.com", passwordHash, department: "Sales" },
      { name: "Sofia Patel", email: "sofia.patel@example.com", passwordHash, department: "Product" },
      { name: "Owen Wright", email: "owen.wright@example.com", passwordHash, department: "Operations" },
      { name: "Ravi Shah", email: "ravi.shah@example.com", passwordHash, department: "Research" },
      { name: "Nora Kim", email: "nora.kim@example.com", passwordHash, department: "Engineering" },
    ])
    .returning();

  await db.insert(budgetsTable).values([
    { name: "Product & Design", department: "Product", limitAmount: 24000, period: "August 2026" },
    { name: "Sales & Success", department: "Sales", limitAmount: 28000, period: "August 2026" },
    { name: "Operations", department: "Operations", limitAmount: 12000, period: "August 2026" },
    { name: "Research", department: "Research", limitAmount: 16000, period: "August 2026" },
    { name: "Engineering", department: "Engineering", limitAmount: 20000, period: "August 2026" },
  ]);

  console.log(`Seed complete. Created 6 users (password: "${DEMO_PASSWORD}") and 5 budgets.`);
  console.log(`Sign in as ${maya?.email} to start as the finance lead.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
