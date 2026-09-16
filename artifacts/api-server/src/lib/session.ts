import jwt from "jsonwebtoken";

const SESSION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET must be set to a long random string (see .env.example).",
    );
  }
  return secret;
}

export interface SessionPayload {
  userId: string;
}

export function signSessionToken(payload: SessionPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
      return { userId: String((decoded as Record<string, unknown>).userId) };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = "session";

export function sessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    // Port differences (e.g. localhost:5173 -> localhost:5000 in dev) are
    // not cross-site per the Same-Site spec, so "lax" works for local dev
    // and for same-domain production deployments.
    sameSite: "lax" as const,
    maxAge: SESSION_COOKIE_MAX_AGE_MS,
    path: "/",
  };
}
