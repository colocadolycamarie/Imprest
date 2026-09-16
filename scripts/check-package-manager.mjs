// Cross-platform guard: enforce pnpm and clean up stray lockfiles from
// other package managers. Runs via `node`, so it works identically on
// Windows, macOS, and Linux (the previous `sh -c '...'` version only
// worked on Unix shells).
import { rmSync } from "node:fs";

rmSync("package-lock.json", { force: true });
rmSync("yarn.lock", { force: true });

const userAgent = process.env.npm_config_user_agent ?? "";
if (!userAgent.startsWith("pnpm/")) {
  console.error("Use pnpm instead (npm install -g pnpm && pnpm install).");
  process.exit(1);
}
