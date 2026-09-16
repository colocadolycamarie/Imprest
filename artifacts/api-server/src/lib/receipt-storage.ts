import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, put } from "@vercel/blob";

/**
 * Receipt file storage. Two backends, chosen automatically:
 *
 * - Local disk (default): used when no BLOB_READ_WRITE_TOKEN is set, e.g.
 *   local development. Not durable on Vercel — its filesystem is ephemeral
 *   and reset between invocations, so this path must not be used there.
 * - Vercel Blob: used automatically when BLOB_READ_WRITE_TOKEN is present
 *   (Vercel sets this itself once a Blob store is linked to the project).
 *
 * The rest of the app only ever sees an opaque `storageKey` string and
 * calls save/read/delete below — nothing else needs to know which backend
 * is active. To add a third backend (e.g. S3), this is the only file that
 * changes.
 */
const useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const uploadRoot = path.resolve(
  process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"),
  "receipts",
);

function resolveLocalPath(storageKey: string): string {
  return path.join(uploadRoot, storageKey);
}

export async function saveReceiptFile(
  expenseId: string,
  originalName: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const ext = path.extname(originalName).slice(0, 10);
  const filename = `${expenseId}-${randomUUID()}${ext}`;

  if (useBlobStorage) {
    // Access is "public" (Blob has no private-by-default tier at the free
    // level), but the storage key is an unguessable random filename and
    // the only client-facing path to it is the authenticated
    // /expenses/:id/receipt route, which fetches and streams the bytes
    // itself rather than ever handing this URL to the browser.
    const blob = await put(`receipts/${filename}`, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await mkdir(uploadRoot, { recursive: true });
  await writeFile(resolveLocalPath(filename), buffer);
  return filename;
}

export async function readReceiptFile(
  storageKey: string,
): Promise<Buffer | null> {
  if (storageKey.startsWith("http")) {
    const response = await fetch(storageKey);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }

  try {
    return await readFile(resolveLocalPath(storageKey));
  } catch {
    return null;
  }
}

export async function deleteReceiptFile(storageKey: string | null): Promise<void> {
  if (!storageKey) return;

  if (storageKey.startsWith("http")) {
    await del(storageKey).catch(() => {
      // Already gone, or the Blob store isn't configured — either way
      // there's nothing more useful to do than continue.
    });
    return;
  }

  await rm(resolveLocalPath(storageKey), { force: true });
}
