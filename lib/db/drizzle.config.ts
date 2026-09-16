import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the monorepo root .env regardless of which directory this command
// was invoked from (pnpm --filter runs scripts with cwd set to the
// package, not the repo root, so process.env alone isn't enough).
config({ path: path.resolve(__dirname, "../../.env") });

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set to a Postgres connection string (see .env.example).",
  );
}

export default defineConfig({
  schema: "./src/schema/index.ts",  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
