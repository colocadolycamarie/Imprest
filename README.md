# Imprest

Corporate expense management: submit expenses, route them through approvals,
and track department budgets against real spend.

The name comes from bookkeeping — an *imprest* is a fixed float of cash
advanced to someone for minor expenses, drawn against and then accounted for
so the float can be replenished. That's the whole product in one word. See
`Imprest-UIUX-Design-Brief-v1.md` for the full visual identity and UX spec
this app is built against (color tokens, the Float Ring / Counterfoil / Stamp
component language, page-by-page behavior).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS 4 + TanStack Query
- API: Express 5, cookie-based session auth (JWT + bcrypt), local-disk file
  storage for receipts
- Database: PostgreSQL + Drizzle ORM
- Validation: Zod, shared between server and generated client via `drizzle-zod`
- API codegen: Orval, generating typed React Query hooks and Zod schemas from
  the OpenAPI spec in `lib/api-spec`

## Getting started

```bash
pnpm install
cp .env.example .env
```

On Windows PowerShell, use `copy .env.example .env` instead of `cp`. If
`pnpm install` reports ignored build scripts, run `pnpm approve-builds` and
approve `esbuild` — it's a real dependency this project uses to bundle the
API server, and pnpm blocks native install scripts by default as a
supply-chain safety measure.

Edit `.env`:
- `DATABASE_URL` — a running Postgres instance
- `JWT_SECRET` — generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `CORS_ORIGIN` / `UPLOAD_DIR` — sane defaults are already filled in for local dev

```bash
pnpm --filter @workspace/db run push    # create tables from the schema
pnpm --filter @workspace/db run seed    # optional: seed sample users/budgets
```

The seed creates 6 demo users, all with password `imprest-demo` — sign in
as `maya.chen@example.com` to start as the finance lead, or register a new
account from the login screen.

Run the app (two terminals):

```bash
pnpm --filter @workspace/api-server run dev   # API on :5000
pnpm --filter @workspace/imprest-app run dev   # frontend on :5173
```

The frontend dev server proxies `/api/*` to the API server (configurable via
`API_PROXY_TARGET`, default `http://localhost:5000`), so the browser only
ever talks to `:5173` — this is also what makes the session cookie work
without extra CORS configuration in dev.

## Authentication

Session-based auth: `POST /api/auth/login` sets an httpOnly cookie (a signed
JWT); every other `/api` route requires it. Passwords are hashed with bcrypt
(`lib/db/src/auth.ts`). There's no password-reset flow yet — that's the next
natural addition if this goes further (it's specced in the design brief's
Section 8.4/8.5).

## Receipt storage

Two backends, chosen automatically by `artifacts/api-server/src/lib/receipt-storage.ts`:
local disk (default, used when no `BLOB_READ_WRITE_TOKEN` is set — this is
what local dev uses) or Vercel Blob (used automatically once a Blob store
is connected — see the Vercel deployment section below). The rest of the
app only ever sees an opaque `storageKey` string, so a third backend (e.g.
S3) would mean changing that one file only. Accepted types: JPEG, PNG,
WEBP, HEIC, PDF, up to 10MB.

## Deploying to Vercel

This repo is set up to deploy as a single Vercel project: the frontend
builds to static files, and the API runs as a serverless function
(`api/[...path].mjs`, which wraps the same Express app used for local dev —
no route logic is duplicated).

1. **Database**: use a Postgres provider that supports serverless
   connection pooling (Neon or Supabase both work). Use the **pooled**
   connection string for `DATABASE_URL` in production — a plain direct
   connection string can exhaust your database's connection limit under
   serverless traffic, since each cold start may open a new connection.
2. **File storage**: in the Vercel dashboard, go to **Storage → Create
   Database → Blob** and connect it to this project. Vercel sets
   `BLOB_READ_WRITE_TOKEN` automatically once connected — the app detects
   this and switches from local-disk storage to Vercel Blob automatically
   (see `artifacts/api-server/src/lib/receipt-storage.ts`). No code changes
   needed.
3. **Environment variables** — set these in the Vercel project settings:
   - `DATABASE_URL` — your pooled Postgres connection string
   - `JWT_SECRET` — same as local (a long random string)
   - `CORS_ORIGIN` — your production URL, e.g. `https://your-app.vercel.app`
     (same-origin requests don't strictly need this, but it's a safety net
     for preview deployments and custom domains)
   - `BLOB_READ_WRITE_TOKEN` — set automatically once you connect Blob storage
4. **Push the schema** to your production database once, from your machine,
   with `DATABASE_URL` pointed at production:
   ```bash
   pnpm --filter @workspace/db run push
   ```
5. Import the repo in Vercel and deploy — `vercel.json` handles the rest
   (build command, output directory, and routing both `/api/*` to the
   serverless function and everything else to the SPA).

## Common tasks

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and
  Zod schemas after editing the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push schema changes to the database
  (dev only; use real migrations for production)

## Where things live

- `artifacts/imprest-app` — the React frontend
- `artifacts/api-server` — the Express API (routes for the product live in
  `src/routes/imprest.ts`)
- `lib/db` — Drizzle schema, DB client, password hashing, and the dev seed script
- `lib/api-spec` — the OpenAPI spec that's the source of truth for the API
  contract
- `lib/api-zod` / `lib/api-client-react` — generated (do not hand-edit)
- `scripts` — one-off operational scripts (e.g. `post-merge.sh`)

## Design system

The frontend implements Imprest's own visual language rather than a generic
component-library look — see `Imprest-UIUX-Design-Brief-v1.md` for the full
spec. Three components carry the identity and are worth knowing before
touching UI code:

- **`components/float-ring.tsx`** — the circular ring used everywhere a
  quantity sits against a boundary (budget consumption, approval SLAs).
  Never reach for a linear progress bar; use this instead.
- **`components/counterfoil-card.tsx`** — the torn-stub expense record card.
  This is the primary way expense records are listed (see the Expenses page).
- **`components/status-stamp.tsx`** — the rotated, ink-stamp status marker.
  `CHANGES_REQUESTED` renders with a dashed ring specifically so it's never
  confused with `SUBMITTED` by color alone — don't change that without
  updating both.

All color/spacing/type tokens live in `artifacts/imprest-app/src/index.css`.

## Known gaps

- **Password reset / email verification** — not implemented. Registration and
  login work; there's no "forgot password" flow yet.
- **Authorization is all-or-nothing** — any signed-in user can see and act on
  any expense/approval/budget (matches how the UI was originally designed:
  one shared workspace). There's no per-role restriction (e.g. only managers
  can approve) yet — the design brief specs a Submitter / Approver / Finance
  Lead role model as the next real addition here.
- **No notifications feed, global search, or team/roles settings UI** —
  specced in the design brief (§8.13, §8.15, §7) but not yet built; each
  needs new API routes, not just frontend work.
