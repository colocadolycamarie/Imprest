import express, { type Express, type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { HttpError } from "./lib/http-error";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Credentialed requests (the session cookie) require an explicit origin â€”
// the wildcard "*" is rejected by browsers once `credentials: true` is set.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
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
app.use(router);

// Centralized error handler â€” must be registered last, and must keep all
// four parameters for Express to recognize it as an error handler. Without
// this, thrown errors (e.g. multer's fileFilter rejections) fall through to
// Express's default handler, which returns a raw stack trace as HTML.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled request error");

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "That file is larger than the 10MB limit."
        : "The file upload could not be processed.";
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  // Anything else is unexpected â€” never forward its message to the client,
  // since it could be a DB error, file path, or other internal detail.
  res.status(500).json({ error: "Something went wrong." });
});

export default app;
