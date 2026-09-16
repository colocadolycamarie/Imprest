import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load the monorepo root .env before importing anything that reads
// process.env at module-load time (app.ts, lib/session.ts, etc.).
config({ path: path.resolve(__dirname, "../../../.env") });

const { default: app } = await import("./app");
const { logger } = await import("./lib/logger");

const rawPort = process.env["PORT"] ?? "5000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
