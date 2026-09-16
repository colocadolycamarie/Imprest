import { Router, type IRouter } from "express";
import { db, hashPassword, usersTable, verifyPassword } from "@workspace/db";
import { eq } from "drizzle-orm";
import { LoginBody, RegisterBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/require-auth";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSessionToken,
} from "../lib/session";

const router: IRouter = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toUserResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    department: user.department,
  };
}

router.post("/register", async (req, res): Promise<void> => {
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
  const [user] = await db
    .insert(usersTable)
    .values({ name, email, passwordHash, department })
    .returning();

  if (!user) {
    res.status(500).json({ error: "Could not create the account." });
    return;
  }

  const token = signSessionToken({ userId: user.id });
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  res.status(201).json(toUserResponse(user));
});

router.post("/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  // Deliberately identical response for "no such user" and "wrong password"
  // so the endpoint doesn't leak which emails are registered.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: "Incorrect email or password." });
    return;
  }

  const token = signSessionToken({ userId: user.id });
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  res.json(toUserResponse(user));
});

router.post("/logout", (_req, res): void => {
  res.clearCookie(SESSION_COOKIE_NAME, { ...sessionCookieOptions(), maxAge: undefined });
  res.status(204).end();
});

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }
  res.json(toUserResponse(user));
});

export default router;
