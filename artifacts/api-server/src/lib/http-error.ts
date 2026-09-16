/**
 * Thrown deliberately by route/middleware code (e.g. multer's fileFilter)
 * when a request should be rejected with a specific, client-safe message.
 * The central error handler in app.ts trusts this message; it must never
 * be constructed with anything that could leak internals (stack traces,
 * DB errors, file paths).
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
