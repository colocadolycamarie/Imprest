import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import * as schema from "./schema";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the monorepo root .env regardless of which directory this was
// invoked from (pnpm --filter runs with cwd set to the package, not the
// repo root). Skipped on Vercel, which injects env vars directly — there's
// no .env file there, and dotenv would just print a random marketing tip
// to the function logs for no reason.
if (!process.env.VERCEL) {
  config({ path: path.resolve(__dirname, "../../../.env"), quiet: true });
}

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set to a Postgres connection string (see .env.example).",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
export * from "./auth";
