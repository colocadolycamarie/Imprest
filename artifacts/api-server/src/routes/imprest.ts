import { Router, type IRouter } from "express";
import multer from "multer";
import {
  db,
  activityLogTable,
  approvalsTable,
  budgetsTable,
  expensesTable,
  usersTable,
} from "@workspace/db";
import { and, desc, eq, gte, ilike, isNull, lt, or, sql } from "drizzle-orm";
import {
  CreateExpenseBody,
  DecideApprovalBody,
  GetDashboardSummaryResponse,
  GetExpenseResponse,
  ListApprovalsResponse,
  ListBudgetsResponse,
  ListExpensesQueryParams,
  ListExpensesResponse,
  SubmitExpenseResponse,
  UpdateExpenseBody,
  UpdateExpenseResponse,
} from "@workspace/api-zod";
import {
  deleteReceiptFile,
  readReceiptFile,
  saveReceiptFile,
} from "../lib/receipt-storage";
import { HttpError } from "../lib/http-error";
import {
  approvalDueDate,
  deriveDepartment,
  derivePolicyFlag,
  describeSla,
} from "../lib/imprest-format";

const router: IRouter = Router();

const ALLOWED_RECEIPT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_RECEIPT_TYPES.has(file.mimetype)) {
      callback(new HttpError(400, "Receipts must be a JPEG, PNG, WEBP, HEIC, or PDF file."));
      return;
    }
    callback(null, true);
  },
});

function routeParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

/** Shapes a DB expense row (joined with its submitter) into the API's
 * public Expense contract. */
function toExpenseResponse(row: {
  expenses: typeof expensesTable.$inferSelect;
  users: typeof usersTable.$inferSelect | null;
}) {
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
    policyFlag: expense.policyFlag,
  };
}

function toApprovalResponse(
  approval: typeof approvalsTable.$inferSelect,
  expense: typeof expensesTable.$inferSelect,
  submitterName: string,
) {
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
    sla: describeSla(approval.dueAt),
  };
}

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [monthToDateRow] = await db
    .select({ total: sql<number>`coalesce(sum(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(
      and(
        sql`${expensesTable.status} != 'DRAFT'`,
        gte(expensesTable.expenseDate, monthStart.toISOString().slice(0, 10)),
      ),
    );

  const [prevMonthRow] = await db
    .select({ total: sql<number>`coalesce(sum(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(
      and(
        sql`${expensesTable.status} != 'DRAFT'`,
        gte(expensesTable.expenseDate, prevMonthStart.toISOString().slice(0, 10)),
        lt(expensesTable.expenseDate, monthStart.toISOString().slice(0, 10)),
      ),
    );

  const [reimbursedRow] = await db
    .select({ total: sql<number>`coalesce(sum(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.status, "REIMBURSED"),
        gte(expensesTable.expenseDate, monthStart.toISOString().slice(0, 10)),
      ),
    );

  const [pendingReviewRow] = await db
    .select({ total: sql<number>`coalesce(sum(${expensesTable.amount}), 0)` })
    .from(approvalsTable)
    .innerJoin(expensesTable, eq(approvalsTable.expenseId, expensesTable.id))
    .where(isNull(approvalsTable.decision));

  const [policyExceptionsRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(expensesTable)
    .where(sql`${expensesTable.policyFlag} is not null`);

  const activityRows = await db
    .select()
    .from(activityLogTable)
    .orderBy(desc(activityLogTable.createdAt))
    .limit(6);

  const monthToDate = Number(monthToDateRow?.total ?? 0);
  const prevMonthTotal = Number(prevMonthRow?.total ?? 0);
  const monthlyChange =
    prevMonthTotal > 0
      ? Number((((monthToDate - prevMonthTotal) / prevMonthTotal) * 100).toFixed(1))
      : 0;

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
      tone: item.tone,
    })),
  };

  res.json(GetDashboardSummaryResponse.parse(summary));
});

router.get("/expenses", async (req, res): Promise<void> => {
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    req.log.warn({ error: parsed.error.message }, "Invalid expense filters");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { status, search } = parsed.data;
  const conditions = [];
  if (status) conditions.push(eq(expensesTable.status, status as (typeof expensesTable.status.enumValues)[number]));
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        ilike(expensesTable.merchant, term),
        ilike(expensesTable.category, term),
        ilike(usersTable.name, term),
      ),
    );
  }

  const rows = await db
    .select()
    .from(expensesTable)
    .leftJoin(usersTable, eq(expensesTable.submitterId, usersTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(expensesTable.createdAt));

  res.json(ListExpensesResponse.parse(rows.map(toExpenseResponse)));
});

router.post("/expenses", async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ error: parsed.error.message }, "Invalid expense input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const input = parsed.data;
  const submitterId = req.user!.id;

  const [inserted] = await db
    .insert(expensesTable)
    .values({
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
      policyFlag: derivePolicyFlag(input.amount, false),
    })
    .returning();

  if (!inserted) {
    res.status(500).json({ error: "Failed to create expense" });
    return;
  }

  const [submitter] = await db.select().from(usersTable).where(eq(usersTable.id, submitterId));

  res
    .status(201)
    .json(GetExpenseResponse.parse(toExpenseResponse({ expenses: inserted, users: submitter ?? null })));
});

router.get("/expenses/:id", async (req, res): Promise<void> => {
  const [row] = await db
    .select()
    .from(expensesTable)
    .leftJoin(usersTable, eq(expensesTable.submitterId, usersTable.id))
    .where(eq(expensesTable.id, routeParam(req.params.id)));

  if (!row) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  res.json(GetExpenseResponse.parse(toExpenseResponse(row)));
});

router.patch("/expenses/:id", async (req, res): Promise<void> => {
  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ error: parsed.error.message }, "Invalid expense update");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  const patch = parsed.data;
  const nextAmount = patch.amount ?? existing.amount;
  const nextCostCenter = patch.costCenter !== undefined ? patch.costCenter : existing.costCenter;

  const [updated] = await db
    .update(expensesTable)
    .set({
      ...patch,
      costCenter: nextCostCenter,
      department: deriveDepartment(nextCostCenter),
      policyFlag: derivePolicyFlag(nextAmount, Boolean(existing.receiptStorageKey)),
      updatedAt: new Date(),
    })
    .where(eq(expensesTable.id, id))
    .returning();

  const [submitter] = await db.select().from(usersTable).where(eq(usersTable.id, existing.submitterId));

  res.json(UpdateExpenseResponse.parse(toExpenseResponse({ expenses: updated!, users: submitter ?? null })));
});

router.post("/expenses/:id/submit", async (req, res): Promise<void> => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  const [updated] = await db
    .update(expensesTable)
    .set({ status: "SUBMITTED", updatedAt: new Date() })
    .where(eq(expensesTable.id, id))
    .returning();

  const [openApproval] = await db
    .select()
    .from(approvalsTable)
    .where(and(eq(approvalsTable.expenseId, id), isNull(approvalsTable.decision)));

  if (!openApproval) {
    const now = new Date();
    await db.insert(approvalsTable).values({
      expenseId: id,
      department: existing.department,
      submittedAt: now,
      dueAt: approvalDueDate(now),
    });
  }

  const [submitter] = await db.select().from(usersTable).where(eq(usersTable.id, existing.submitterId));

  await db.insert(activityLogTable).values({
    label: "Expense submitted",
    detail: `${existing.merchant} · $${existing.amount.toFixed(2)}`,
    tone: "pending",
    expenseId: id,
  });

  res.json(SubmitExpenseResponse.parse(toExpenseResponse({ expenses: updated!, users: submitter ?? null })));
});

router.post("/expenses/:id/receipt", upload.single("receipt"), async (req, res): Promise<void> => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  if (!req.file) {
    res.status(400).json({ error: "No receipt file was uploaded." });
    return;
  }

  // Replacing an existing receipt: remove the old file after the new one lands.
  const previousStorageKey = existing.receiptStorageKey;
  const storageKey = await saveReceiptFile(id, req.file.originalname, req.file.buffer, req.file.mimetype);

  const [updated] = await db
    .update(expensesTable)
    .set({
      receiptStorageKey: storageKey,
      receiptFilename: req.file.originalname,
      receiptMimeType: req.file.mimetype,
      receiptSizeBytes: req.file.size,
      policyFlag: derivePolicyFlag(existing.amount, true),
      updatedAt: new Date(),
    })
    .where(eq(expensesTable.id, id))
    .returning();

  await deleteReceiptFile(previousStorageKey);

  const [submitter] = await db.select().from(usersTable).where(eq(usersTable.id, existing.submitterId));
  res.json(GetExpenseResponse.parse(toExpenseResponse({ expenses: updated!, users: submitter ?? null })));
});

router.get("/expenses/:id/receipt", async (req, res): Promise<void> => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq(expensesTable.id, id));
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
    `attachment; filename="${(existing.receiptFilename ?? "receipt").replaceAll('"', "")}"`,
  );
  res.send(file);
});

router.delete("/expenses/:id/receipt", async (req, res): Promise<void> => {
  const id = routeParam(req.params.id);
  const [existing] = await db.select().from(expensesTable).where(eq(expensesTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  await deleteReceiptFile(existing.receiptStorageKey);

  const [updated] = await db
    .update(expensesTable)
    .set({
      receiptStorageKey: null,
      receiptFilename: null,
      receiptMimeType: null,
      receiptSizeBytes: null,
      policyFlag: derivePolicyFlag(existing.amount, false),
      updatedAt: new Date(),
    })
    .where(eq(expensesTable.id, id))
    .returning();

  const [submitter] = await db.select().from(usersTable).where(eq(usersTable.id, existing.submitterId));
  res.json(GetExpenseResponse.parse(toExpenseResponse({ expenses: updated!, users: submitter ?? null })));
});

router.get("/approvals", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(approvalsTable)
    .innerJoin(expensesTable, eq(approvalsTable.expenseId, expensesTable.id))
    .leftJoin(usersTable, eq(expensesTable.submitterId, usersTable.id))
    .where(isNull(approvalsTable.decision))
    .orderBy(approvalsTable.dueAt);

  res.json(
    ListApprovalsResponse.parse(
      rows.map((row) =>
        toApprovalResponse(row.approvals, row.expenses, row.users?.name ?? "Unknown"),
      ),
    ),
  );
});

router.post("/approvals/:id/decision", async (req, res): Promise<void> => {
  const parsed = DecideApprovalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const id = routeParam(req.params.id);
  const [row] = await db
    .select()
    .from(approvalsTable)
    .innerJoin(expensesTable, eq(approvalsTable.expenseId, expensesTable.id))
    .leftJoin(usersTable, eq(expensesTable.submitterId, usersTable.id))
    .where(eq(approvalsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Approval not found" });
    return;
  }

  const { decision, comment } = parsed.data;
  const nextStatus =
    decision === "APPROVED" ? "APPROVED" : decision === "REJECTED" ? "REJECTED" : "CHANGES_REQUESTED";

  await db
    .update(expensesTable)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(expensesTable.id, row.expenses.id));

  const [updatedApproval] = await db
    .update(approvalsTable)
    .set({ decision, comment: comment ?? null, decidedAt: new Date() })
    .where(eq(approvalsTable.id, id))
    .returning();

  await db.insert(activityLogTable).values({
    label:
      decision === "APPROVED"
        ? "Expense approved"
        : decision === "REJECTED"
          ? "Expense rejected"
          : "Changes requested",
    detail: `${row.expenses.merchant} · $${row.expenses.amount.toFixed(2)}`,
    tone: decision === "APPROVED" ? "positive" : decision === "REJECTED" ? "negative" : "pending",
    expenseId: row.expenses.id,
  });

  res.json(toApprovalResponse(updatedApproval!, row.expenses, row.users?.name ?? "Unknown"));
});

router.get("/budgets", async (_req, res): Promise<void> => {
  const budgets = await db.select().from(budgetsTable);

  const spendByDepartment = await db
    .select({
      department: expensesTable.department,
      total: sql<number>`coalesce(sum(${expensesTable.amount}), 0)`,
    })
    .from(expensesTable)
    .where(sql`${expensesTable.status} not in ('DRAFT', 'REJECTED')`)
    .groupBy(expensesTable.department);

  const spendMap = new Map(spendByDepartment.map((row) => [row.department, Number(row.total)]));

  res.json(
    ListBudgetsResponse.parse(
      budgets.map((budget) => ({
        id: budget.id,
        name: budget.name,
        department: budget.department,
        spent: Number((spendMap.get(budget.department) ?? 0).toFixed(2)),
        limit: budget.limitAmount,
        period: budget.period,
      })),
    ),
  );
});

export default router;
