import { db, usersTable } from "@workspace/db";
import { asc } from "drizzle-orm";

/**
 * There is no login/session system yet, so there is no real notion of "the
 * signed-in user" to attach to a request. Until that lands, every request
 * acts as the earliest-created user in the `users` table (seeded as the
 * finance lead). This keeps expense/approval ownership backed by a real
 * database row instead of a hardcoded "You" string, while making the gap
 * explicit for the next phase (real authentication).
 */
export async function getCurrentUser() {
  const [user] = await db
    .select()
    .from(usersTable)
    .orderBy(asc(usersTable.createdAt))
    .limit(1);

  if (!user) {
    throw new Error(
      "No users exist yet. Run `pnpm --filter @workspace/db run seed` (or create a user) before using the API.",
    );
  }

  return user;
}
