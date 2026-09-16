import { type NextFunction, type Request, type Response } from "express";
import { SESSION_COOKIE_NAME, verifySessionToken } from "../lib/session";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    res.status(401).json({ error: "Not signed in" });
    return;
  }

  req.user = { id: session.userId };
  next();
}
