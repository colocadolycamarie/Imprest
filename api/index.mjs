var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// artifacts/api-server/src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer2 from "multer";
import pinoHttp from "pino-http";

// artifacts/api-server/src/routes/index.ts
import { Router as Router4 } from "express";

// artifacts/api-server/src/routes/auth.ts
import { Router } from "express";

// lib/db/src/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

// lib/db/src/schema/index.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogTable: () => activityLogTable,
  activityToneEnum: () => activityToneEnum,
  approvalDecisionEnum: () => approvalDecisionEnum,
  approvalsTable: () => approvalsTable,
  budgetsTable: () => budgetsTable,
  expenseStatusEnum: () => expenseStatusEnum,
  expensesTable: () => expensesTable,
  usersTable: () => usersTable
});

// lib/db/src/schema/users.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
var usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  department: text("department").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

// lib/db/src/schema/expenses.ts
import {
  pgTable as pgTable2,
  uuid as uuid2,
  text as text2,
  numeric,
  date,
  timestamp as timestamp2,
  pgEnum
} from "drizzle-orm/pg-core";
var expenseStatusEnum = pgEnum("expense_status", [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED",
  "REIMBURSED"
]);
var expensesTable = pgTable2("expenses", {
  id: uuid2("id").primaryKey().defaultRandom(),
  merchant: text2("merchant").notNull(),
  category: text2("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2, mode: "number" }).notNull(),
  currency: text2("currency").notNull().default("USD"),
  expenseDate: date("expense_date").notNull(),
  status: expenseStatusEnum("status").notNull().default("DRAFT"),
  submitterId: uuid2("submitter_id").notNull().references(() => usersTable.id),
  receiptFilename: text2("receipt_filename"),
  receiptMimeType: text2("receipt_mime_type"),
  receiptSizeBytes: numeric("receipt_size_bytes", { mode: "number" }),
  // Relative path under the storage root (see lib/storage.ts). Never expose
  // this directly to clients — always serve receipts through the
  // authenticated /expenses/:id/receipt endpoint.
  receiptStorageKey: text2("receipt_storage_key"),
  description: text2("description").notNull(),
  // Free-text cost center as entered on the form, e.g. "CC-204 · Product".
  costCenter: text2("cost_center"),
  // Parsed from costCenter (or defaulted) so budgets/approvals can group by
  // department without re-parsing a display string on every read.
  department: text2("department").notNull().default("General"),
  policyFlag: text2("policy_flag"),
  createdAt: timestamp2("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp2("updated_at", { withTimezone: true }).notNull().defaultNow()
});

// lib/db/src/schema/approvals.ts
import { pgTable as pgTable3, uuid as uuid3, text as text3, timestamp as timestamp3, pgEnum as pgEnum2 } from "drizzle-orm/pg-core";
var approvalDecisionEnum = pgEnum2("approval_decision", [
  "APPROVED",
  "REJECTED",
  "CHANGES_REQUESTED"
]);
var approvalsTable = pgTable3("approvals", {
  id: uuid3("id").primaryKey().defaultRandom(),
  expenseId: uuid3("expense_id").notNull().references(() => expensesTable.id),
  department: text3("department").notNull(),
  submittedAt: timestamp3("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  // SLA deadline, set when the approval is created; the API derives the
  // human-readable "Due in N days" string from this at read time.
  dueAt: timestamp3("due_at", { withTimezone: true }).notNull(),
  // Null while the item is still sitting in the open queue.
  decision: approvalDecisionEnum("decision"),
  comment: text3("comment"),
  decidedAt: timestamp3("decided_at", { withTimezone: true })
});

// lib/db/src/schema/budgets.ts
import { pgTable as pgTable4, uuid as uuid4, text as text4, numeric as numeric2 } from "drizzle-orm/pg-core";
var budgetsTable = pgTable4("budgets", {
  id: uuid4("id").primaryKey().defaultRandom(),
  name: text4("name").notNull(),
  department: text4("department").notNull(),
  limitAmount: numeric2("limit_amount", {
    precision: 12,
    scale: 2,
    mode: "number"
  }).notNull(),
  period: text4("period").notNull()
});

// lib/db/src/schema/activity.ts
import { pgTable as pgTable5, uuid as uuid5, text as text5, timestamp as timestamp4, pgEnum as pgEnum3 } from "drizzle-orm/pg-core";
var activityToneEnum = pgEnum3("activity_tone", [
  "positive",
  "negative",
  "pending"
]);
var activityLogTable = pgTable5("activity_log", {
  id: uuid5("id").primaryKey().defaultRandom(),
  label: text5("label").notNull(),
  detail: text5("detail").notNull(),
  tone: activityToneEnum("tone").notNull().default("pending"),
  expenseId: uuid5("expense_id").references(() => expensesTable.id),
  createdAt: timestamp4("created_at", { withTimezone: true }).notNull().defaultNow()
});

// lib/db/src/auth.ts
import bcrypt from "bcryptjs";
var SALT_ROUNDS = 12;
function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}
function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

// lib/db/src/index.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.VERCEL) {
  config({ path: path.resolve(__dirname, "../../../.env"), quiet: true });
}
var { Pool } = pg;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set to a Postgres connection string (see .env.example)."
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// artifacts/api-server/src/routes/auth.ts
import { eq } from "drizzle-orm";

// lib/api-zod/src/generated/api.ts
import * as zod from "zod";
var registerBodyPasswordMin = 8;
var RegisterBody = zod.object({
  "name": zod.string().min(1),
  "email": zod.string(),
  "password": zod.string().min(registerBodyPasswordMin),
  "department": zod.string().min(1)
});
var RegisterResponse = zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "department": zod.string()
});
var LoginBody = zod.object({
  "email": zod.string(),
  "password": zod.string()
});
var LoginResponse = zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "department": zod.string()
});
var LogoutResponse = zod.void();
var GetCurrentUserResponse = zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "department": zod.string()
});
var HealthCheckResponse = zod.object({
  "status": zod.string()
});
var GetDashboardSummaryResponse = zod.object({
  "monthToDate": zod.number(),
  "pendingReview": zod.number(),
  "reimbursed": zod.number(),
  "policyExceptions": zod.number(),
  "monthlyChange": zod.number(),
  "recentActivity": zod.array(zod.object({
    "id": zod.string(),
    "label": zod.string(),
    "detail": zod.string(),
    "timestamp": zod.string(),
    "tone": zod.string()
  }))
});
var ListExpensesQueryParams = zod.object({
  "status": zod.coerce.string().optional(),
  "search": zod.coerce.string().optional()
});
var ListExpensesResponseItem = zod.object({
  "id": zod.string(),
  "merchant": zod.string(),
  "category": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "status": zod.string(),
  "submitter": zod.string(),
  "receipt": zod.boolean(),
  "receiptFilename": zod.string().nullish(),
  "description": zod.string(),
  "costCenter": zod.string().nullish(),
  "policyFlag": zod.string().nullish()
});
var ListExpensesResponse = zod.array(ListExpensesResponseItem);
var createExpenseBodyAmountMin = 0;
var CreateExpenseBody = zod.object({
  "merchant": zod.string().min(1),
  "category": zod.string(),
  "amount": zod.number().min(createExpenseBodyAmountMin),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "description": zod.string(),
  "costCenter": zod.string().nullish()
});
var CreateExpenseResponse = zod.object({
  "id": zod.string(),
  "merchant": zod.string(),
  "category": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "status": zod.string(),
  "submitter": zod.string(),
  "receipt": zod.boolean(),
  "receiptFilename": zod.string().nullish(),
  "description": zod.string(),
  "costCenter": zod.string().nullish(),
  "policyFlag": zod.string().nullish()
});
var GetExpenseParams = zod.object({
  "id": zod.coerce.string()
});
var GetExpenseResponse = zod.object({
  "id": zod.string(),
  "merchant": zod.string(),
  "category": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "status": zod.string(),
  "submitter": zod.string(),
  "receipt": zod.boolean(),
  "receiptFilename": zod.string().nullish(),
  "description": zod.string(),
  "costCenter": zod.string().nullish(),
  "policyFlag": zod.string().nullish()
});
var UpdateExpenseParams = zod.object({
  "id": zod.coerce.string()
});
var updateExpenseBodyAmountMin = 0;
var UpdateExpenseBody = zod.object({
  "merchant": zod.string().optional(),
  "category": zod.string().optional(),
  "amount": zod.number().min(updateExpenseBodyAmountMin).optional(),
  "currency": zod.string().optional(),
  "expenseDate": zod.string().optional(),
  "description": zod.string().optional(),
  "costCenter": zod.string().nullish()
});
var UpdateExpenseResponse = zod.object({
  "id": zod.string(),
  "merchant": zod.string(),
  "category": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "status": zod.string(),
  "submitter": zod.string(),
  "receipt": zod.boolean(),
  "receiptFilename": zod.string().nullish(),
  "description": zod.string(),
  "costCenter": zod.string().nullish(),
  "policyFlag": zod.string().nullish()
});
var SubmitExpenseParams = zod.object({
  "id": zod.coerce.string()
});
var SubmitExpenseResponse = zod.object({
  "id": zod.string(),
  "merchant": zod.string(),
  "category": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "status": zod.string(),
  "submitter": zod.string(),
  "receipt": zod.boolean(),
  "receiptFilename": zod.string().nullish(),
  "description": zod.string(),
  "costCenter": zod.string().nullish(),
  "policyFlag": zod.string().nullish()
});
var UploadExpenseReceiptParams = zod.object({
  "id": zod.coerce.string()
});
var UploadExpenseReceiptBody = zod.object({
  "receipt": zod.string()
});
var UploadExpenseReceiptResponse = zod.object({
  "id": zod.string(),
  "merchant": zod.string(),
  "category": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "status": zod.string(),
  "submitter": zod.string(),
  "receipt": zod.boolean(),
  "receiptFilename": zod.string().nullish(),
  "description": zod.string(),
  "costCenter": zod.string().nullish(),
  "policyFlag": zod.string().nullish()
});
var GetExpenseReceiptParams = zod.object({
  "id": zod.coerce.string()
});
var GetExpenseReceiptResponse = zod.unknown();
var DeleteExpenseReceiptParams = zod.object({
  "id": zod.coerce.string()
});
var DeleteExpenseReceiptResponse = zod.object({
  "id": zod.string(),
  "merchant": zod.string(),
  "category": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "expenseDate": zod.string(),
  "status": zod.string(),
  "submitter": zod.string(),
  "receipt": zod.boolean(),
  "receiptFilename": zod.string().nullish(),
  "description": zod.string(),
  "costCenter": zod.string().nullish(),
  "policyFlag": zod.string().nullish()
});
var ListApprovalsResponseItem = zod.object({
  "id": zod.string(),
  "expenseId": zod.string(),
  "merchant": zod.string(),
  "submitter": zod.string(),
  "department": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "category": zod.string(),
  "submittedAt": zod.string(),
  "sla": zod.string()
});
var ListApprovalsResponse = zod.array(ListApprovalsResponseItem);
var DecideApprovalParams = zod.object({
  "id": zod.coerce.string()
});
var DecideApprovalBody = zod.object({
  "decision": zod.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED"]),
  "comment": zod.string().nullish()
});
var DecideApprovalResponse = zod.object({
  "id": zod.string(),
  "expenseId": zod.string(),
  "merchant": zod.string(),
  "submitter": zod.string(),
  "department": zod.string(),
  "amount": zod.number(),
  "currency": zod.string(),
  "category": zod.string(),
  "submittedAt": zod.string(),
  "sla": zod.string()
});
var ListBudgetsResponseItem = zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "department": zod.string(),
  "spent": zod.number(),
  "limit": zod.number(),
  "period": zod.string()
});
var ListBudgetsResponse = zod.array(ListBudgetsResponseItem);

// artifacts/api-server/src/lib/session.ts
import jwt from "jsonwebtoken";
var SESSION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1e3;
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET must be set to a long random string (see .env.example)."
    );
  }
  return secret;
}
function signSessionToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}
function verifySessionToken(token) {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
      return { userId: String(decoded.userId) };
    }
    return null;
  } catch {
    return null;
  }
}
var SESSION_COOKIE_NAME = "session";
function sessionCookieOptions() {
  const isProduction2 = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction2,
    // Port differences (e.g. localhost:5173 -> localhost:5000 in dev) are
    // not cross-site per the Same-Site spec, so "lax" works for local dev
    // and for same-domain production deployments.
    sameSite: "lax",
    maxAge: SESSION_COOKIE_MAX_AGE_MS,
    path: "/"
  };
}

// artifacts/api-server/src/middlewares/require-auth.ts
function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = token ? verifySessionToken(token) : null;
  if (!session) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  req.user = { id: session.userId };
  next();
}

// artifacts/api-server/src/routes/auth.ts
var router = Router();
var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function toUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department
  };
}
router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, department } = parsed.data;
  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, department }).returning();
  if (!user) {
    res.status(500).json({ error: "Could not create the account." });
    return;
  }
  const token = signSessionToken({ userId: user.id });
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  res.status(201).json(toUserResponse(user));
});
router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !await verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Incorrect email or password." });
    return;
  }
  const token = signSessionToken({ userId: user.id });
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  res.json(toUserResponse(user));
});
router.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { ...sessionCookieOptions(), maxAge: void 0 });
  res.status(204).end();
});
router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user.id));
  if (!user) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  res.json(toUserResponse(user));
});
var auth_default = router;

// artifacts/api-server/src/routes/health.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});
var health_default = router2;

// artifacts/api-server/src/routes/imprest.ts
import { Router as Router3 } from "express";
import multer from "multer";
import { and, desc, eq as eq2, gte, ilike, isNull, lt, or, sql } from "drizzle-orm";

// artifacts/api-server/src/lib/receipt-storage.ts
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path2 from "node:path";
import { del, put } from "@vercel/blob";
var useBlobStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
var uploadRoot = path2.resolve(
  process.env.UPLOAD_DIR ?? path2.join(process.cwd(), "uploads"),
  "receipts"
);
function resolveLocalPath(storageKey) {
  return path2.join(uploadRoot, storageKey);
}
async function saveReceiptFile(expenseId, originalName, buffer, mimeType) {
  const ext = path2.extname(originalName).slice(0, 10);
  const filename = `${expenseId}-${randomUUID()}${ext}`;
  if (useBlobStorage) {
    const blob = await put(`receipts/${filename}`, buffer, {
      access: "public",
      contentType: mimeType,
      addRandomSuffix: false
    });
    return blob.url;
  }
  await mkdir(uploadRoot, { recursive: true });
  await writeFile(resolveLocalPath(filename), buffer);
  return filename;
}
async function readReceiptFile(storageKey) {
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
async function deleteReceiptFile(storageKey) {
  if (!storageKey) return;
  if (storageKey.startsWith("http")) {
    await del(storageKey).catch(() => {
    });
    return;
  }
  await rm(resolveLocalPath(storageKey), { force: true });
}

// artifacts/api-server/src/lib/http-error.ts
var HttpError = class extends Error {
  status;
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
};

// artifacts/api-server/src/lib/imprest-format.ts
var RECEIPT_REQUIRED_THRESHOLD = 250;
var APPROVAL_SLA_DAYS = 3;
function deriveDepartment(costCenter) {
  if (!costCenter) return "General";
  const [, department] = costCenter.split(/[·/]/);
  return department?.trim() || "General";
}
function derivePolicyFlag(amount, receipt) {
  return amount > RECEIPT_REQUIRED_THRESHOLD && !receipt ? `Receipt required above $${RECEIPT_REQUIRED_THRESHOLD}` : null;
}
function approvalDueDate(from = /* @__PURE__ */ new Date()) {
  const due = new Date(from);
  due.setDate(due.getDate() + APPROVAL_SLA_DAYS);
  return due;
}
function describeSla(dueAt, now = /* @__PURE__ */ new Date()) {
  const days = Math.ceil((dueAt.getTime() - now.getTime()) / 864e5);
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

// artifacts/api-server/src/routes/imprest.ts
var router3 = Router3();
var ALLOWED_RECEIPT_TYPES = /* @__PURE__ */ new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf"
]);
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_RECEIPT_TYPES.has(file.mimetype)) {
      callback(new HttpError(400, "Receipts must be a JPEG, PNG, WEBP, HEIC, or PDF file."));
      return;
    }
    callback(null, true);
  }
});
function routeParam(value) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
function toExpenseResponse(row) {
  const expense = row.expenses;
  return {
    id: expense.id,
    merchant: expense.merchant,
    category: expense.category,
    amount: expense.amount,
    currency: expense.currency,
    expenseDate: expense.expenseDate,
    status: expense.status,
    submitter: row.users?.name ?? "Unknown",
    receipt: Boolean(expense.receiptStorageKey),
    receiptFilename: expense.receiptFilename,
    description: expense.description,
    costCenter: expense.costCenter,
    policyFlag: expense.policyFlag
  };
}
function toApprovalResponse(approval, expense, submitterName) {
  return {
    id: approval.id,
    expenseId: expense.id,
    merchant: expense.merchant,
    submitter: submitterName,
    department: approval.department,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    submittedAt: approval.submittedAt.toISOString(),
    sla: describeSla(approval.dueAt)
  };
}
router3.get("/dashboard/summary", async (_req, res) => {
  const now = /* @__PURE__ */ new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [monthToDateRow] = await db.select({ total: sql`coalesce(sum(${expensesTable.amount}), 0)` }).from(expensesTable).where(
    and(
      sql`${expensesTable.status} != 'DRAFT'`,
      gte(expensesTable.expenseDate, monthStart.toISOString().slice(0, 10))
    )
  );
  const [prevMonthRow] = await db.select({ total: sql`coalesce(sum(${expensesTable.amount}), 0)` }).from(expensesTable).where(
    and(
      sql`${expensesTable.status} != 'DRAFT'`,
      gte(expensesTable.expenseDate, prevMonthStart.toISOString().slice(0, 10)),
      lt(expensesTable.expenseDate, monthStart.toISOString().slice(0, 10))
    )
  );
  const [reimbursedRow] = await db.select({ total: sql`coalesce(sum(${expensesTable.amount}), 0)` }).from(expensesTable).where(
    and(
      eq2(expensesTable.status, "REIMBURSED"),
      gte(expensesTable.expenseDate, monthStart.toISOString().slice(0, 10))
    )
  );
  const [pendingReviewRow] = await db.select({ total: sql`coalesce(sum(${expensesTable.amount}), 0)` }).from(approvalsTable).innerJoin(expensesTable, eq2(approvalsTable.expenseId, expensesTable.id)).where(isNull(approvalsTable.decision));
  const [policyExceptionsRow] = await db.select({ count: sql`count(*)` }).from(expensesTable).where(sql`${expensesTable.policyFlag} is not null`);
  const activityRows = await db.select().from(activityLogTable).orderBy(desc(activityLogTable.createdAt)).limit(6);
  const monthToDate = Number(monthToDateRow?.total ?? 0);
  const prevMonthTotal = Number(prevMonthRow?.total ?? 0);
  const monthlyChange = prevMonthTotal > 0 ? Number(((monthToDate - prevMonthTotal) / prevMonthTotal * 100).toFixed(1)) : 0;
  const summary = {
    monthToDate: Number(monthToDate.toFixed(2)),
    pendingReview: Number(Number(pendingReviewRow?.total ?? 0).toFixed(2)),
    reimbursed: Number(Number(reimbursedRow?.total ?? 0).toFixed(2)),
    policyExceptions: Number(policyExceptionsRow?.count ?? 0),
    monthlyChange,
    recentActivity: activityRows.map((item) => ({
      id: item.id,
      label: item.label,
      detail: item.detail,
      timestamp: item.createdAt.toISOString(),
      tone: item.tone
    }))
  };
  res.json(GetDashboardSummaryResponse.parse(summary));
});
router3.get("/expenses", async (req, res) => {
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    req.log.warn({ error: parsed.error.message }, "Invalid expense filters");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, search } = parsed.data;
  const conditions = [];
  if (status) conditions.push(eq2(expensesTable.status, status));
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        ilike(expensesTable.merchant, term),
        ilike(expensesTable.category, term),
        ilike(usersTable.name, term)
      )
    );
  }
  const rows = await db.select().from(expensesTable).leftJoin(usersTable, eq2(expensesTable.submitterId, usersTable.id)).where(conditions.length ? and(...conditions) : void 0).orderBy(desc(expensesTable.createdAt));
  res.json(ListExpensesResponse.parse(rows.map(toExpenseResponse)));
});
router3.post("/expenses", async (req, res) => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ error: parsed.error.message }, "Invalid expense input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const input = parsed.data;
  const submitterId = req.user.id;
  const [inserted] = await db.insert(expensesTable).values({
    merchant: input.merchant,
    category: input.category,
    amount: input.amount,
    currency: input.currency,
    expenseDate: input.expenseDate,
    status: "DRAFT",
    submitterId,
    description: input.description,
    costCenter: input.costCenter ?? null,
    department: deriveDepartment(input.costCenter),
    policyFlag: derivePolicyFlag(input.amount, false)
  }).returning();
  if (!inserted) {
    res.status(500).json({ error: "Failed to create expense" });
    return;
  }
  const [submitter] = await db.select().from(usersTable).where(eq2(usersTable.id, submitterId));
  res.status(201).json(GetExpenseResponse.parse(toExpenseResponse({ expenses: inserted, users: submitter ?? null })));
});
router3.get("/expenses/:id", async (req, res) => {
  const [row] = await db.select().from(expensesTable).leftJoin(usersTable, eq2(expensesTable.submitterId, usersTable.id)).where(eq2(expensesTable.id, routeParam(req.params.id)));
  if (!row) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  res.json(GetExpenseResponse.parse(toExpenseResponse(row)));
});
router3.patch("/expenses/:id", async (req, res) => {
  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ error: parsed.error.message }, "Invalid expense update");
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq2(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  const patch = parsed.data;
  const nextAmount = patch.amount ?? existing.amount;
  const nextCostCenter = patch.costCenter !== void 0 ? patch.costCenter : existing.costCenter;
  const [updated] = await db.update(expensesTable).set({
    ...patch,
    costCenter: nextCostCenter,
    department: deriveDepartment(nextCostCenter),
    policyFlag: derivePolicyFlag(nextAmount, Boolean(existing.receiptStorageKey)),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq2(expensesTable.id, id)).returning();
  const [submitter] = await db.select().from(usersTable).where(eq2(usersTable.id, existing.submitterId));
  res.json(UpdateExpenseResponse.parse(toExpenseResponse({ expenses: updated, users: submitter ?? null })));
});
router3.post("/expenses/:id/submit", async (req, res) => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq2(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  const [updated] = await db.update(expensesTable).set({ status: "SUBMITTED", updatedAt: /* @__PURE__ */ new Date() }).where(eq2(expensesTable.id, id)).returning();
  const [openApproval] = await db.select().from(approvalsTable).where(and(eq2(approvalsTable.expenseId, id), isNull(approvalsTable.decision)));
  if (!openApproval) {
    const now = /* @__PURE__ */ new Date();
    await db.insert(approvalsTable).values({
      expenseId: id,
      department: existing.department,
      submittedAt: now,
      dueAt: approvalDueDate(now)
    });
  }
  const [submitter] = await db.select().from(usersTable).where(eq2(usersTable.id, existing.submitterId));
  await db.insert(activityLogTable).values({
    label: "Expense submitted",
    detail: `${existing.merchant} \xB7 $${existing.amount.toFixed(2)}`,
    tone: "pending",
    expenseId: id
  });
  res.json(SubmitExpenseResponse.parse(toExpenseResponse({ expenses: updated, users: submitter ?? null })));
});
router3.post("/expenses/:id/receipt", upload.single("receipt"), async (req, res) => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq2(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No receipt file was uploaded." });
    return;
  }
  const previousStorageKey = existing.receiptStorageKey;
  const storageKey = await saveReceiptFile(id, req.file.originalname, req.file.buffer, req.file.mimetype);
  const [updated] = await db.update(expensesTable).set({
    receiptStorageKey: storageKey,
    receiptFilename: req.file.originalname,
    receiptMimeType: req.file.mimetype,
    receiptSizeBytes: req.file.size,
    policyFlag: derivePolicyFlag(existing.amount, true),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq2(expensesTable.id, id)).returning();
  await deleteReceiptFile(previousStorageKey);
  const [submitter] = await db.select().from(usersTable).where(eq2(usersTable.id, existing.submitterId));
  res.json(GetExpenseResponse.parse(toExpenseResponse({ expenses: updated, users: submitter ?? null })));
});
router3.get("/expenses/:id/receipt", async (req, res) => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq2(expensesTable.id, id));
  if (!existing?.receiptStorageKey) {
    res.status(404).json({ error: "No receipt attached to this expense." });
    return;
  }
  const file = await readReceiptFile(existing.receiptStorageKey);
  if (!file) {
    res.status(404).json({ error: "The receipt file could not be found." });
    return;
  }
  res.setHeader("Content-Type", existing.receiptMimeType ?? "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${(existing.receiptFilename ?? "receipt").replaceAll('"', "")}"`
  );
  res.send(file);
});
router3.delete("/expenses/:id/receipt", async (req, res) => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq2(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  await deleteReceiptFile(existing.receiptStorageKey);
  const [updated] = await db.update(expensesTable).set({
    receiptStorageKey: null,
    receiptFilename: null,
    receiptMimeType: null,
    receiptSizeBytes: null,
    policyFlag: derivePolicyFlag(existing.amount, false),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq2(expensesTable.id, id)).returning();
  const [submitter] = await db.select().from(usersTable).where(eq2(usersTable.id, existing.submitterId));
  res.json(GetExpenseResponse.parse(toExpenseResponse({ expenses: updated, users: submitter ?? null })));
});
router3.get("/approvals", async (_req, res) => {
  const rows = await db.select().from(approvalsTable).innerJoin(expensesTable, eq2(approvalsTable.expenseId, expensesTable.id)).leftJoin(usersTable, eq2(expensesTable.submitterId, usersTable.id)).where(isNull(approvalsTable.decision)).orderBy(approvalsTable.dueAt);
  res.json(
    ListApprovalsResponse.parse(
      rows.map(
        (row) => toApprovalResponse(row.approvals, row.expenses, row.users?.name ?? "Unknown")
      )
    )
  );
});
router3.post("/approvals/:id/decision", async (req, res) => {
  const parsed = DecideApprovalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const id = routeParam(req.params.id);
  const [row] = await db.select().from(approvalsTable).innerJoin(expensesTable, eq2(approvalsTable.expenseId, expensesTable.id)).leftJoin(usersTable, eq2(expensesTable.submitterId, usersTable.id)).where(eq2(approvalsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Approval not found" });
    return;
  }
  const { decision, comment } = parsed.data;
  const nextStatus = decision === "APPROVED" ? "APPROVED" : decision === "REJECTED" ? "REJECTED" : "CHANGES_REQUESTED";
  await db.update(expensesTable).set({ status: nextStatus, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(expensesTable.id, row.expenses.id));
  const [updatedApproval] = await db.update(approvalsTable).set({ decision, comment: comment ?? null, decidedAt: /* @__PURE__ */ new Date() }).where(eq2(approvalsTable.id, id)).returning();
  await db.insert(activityLogTable).values({
    label: decision === "APPROVED" ? "Expense approved" : decision === "REJECTED" ? "Expense rejected" : "Changes requested",
    detail: `${row.expenses.merchant} \xB7 $${row.expenses.amount.toFixed(2)}`,
    tone: decision === "APPROVED" ? "positive" : decision === "REJECTED" ? "negative" : "pending",
    expenseId: row.expenses.id
  });
  res.json(toApprovalResponse(updatedApproval, row.expenses, row.users?.name ?? "Unknown"));
});
router3.get("/budgets", async (_req, res) => {
  const budgets = await db.select().from(budgetsTable);
  const spendByDepartment = await db.select({
    department: expensesTable.department,
    total: sql`coalesce(sum(${expensesTable.amount}), 0)`
  }).from(expensesTable).where(sql`${expensesTable.status} not in ('DRAFT', 'REJECTED')`).groupBy(expensesTable.department);
  const spendMap = new Map(spendByDepartment.map((row) => [row.department, Number(row.total)]));
  res.json(
    ListBudgetsResponse.parse(
      budgets.map((budget) => ({
        id: budget.id,
        name: budget.name,
        department: budget.department,
        spent: Number((spendMap.get(budget.department) ?? 0).toFixed(2)),
        limit: budget.limitAmount,
        period: budget.period
      }))
    )
  );
});
var imprest_default = router3;

// artifacts/api-server/src/routes/index.ts
var router4 = Router4();
router4.use(health_default);
router4.use("/auth", auth_default);
router4.use(requireAuth, imprest_default);
var routes_default = router4;

// artifacts/api-server/src/lib/logger.ts
import pino from "pino";
var isProduction = process.env.NODE_ENV === "production";
var logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']"
  ],
  ...isProduction ? {} : {
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  }
});

// artifacts/api-server/src/app.ts
var app = express();
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0]
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode
        };
      }
    }
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _res, next) => {
  if (req.url === "/api" || req.url.startsWith("/api/")) {
    req.url = req.url.slice(4) || "/";
  }
  next();
});
app.use(routes_default);
app.use((err, req, res, _next) => {
  req.log?.error({ err }, "Unhandled request error");
  if (err instanceof multer2.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "That file is larger than the 10MB limit." : "The file upload could not be processed.";
    res.status(400).json({ error: message });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Something went wrong." });
});
var app_default = app;
export {
  app_default as default
};
