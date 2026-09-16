# IMPREST — UI/UX Design Brief v1 (Figma) — Production-Ready
### Complete rebrand and full redesign, ground-up.

**Why the rename:** *Imprest* is a real accounting term — a fixed float of cash advanced to someone for minor expenses, which they draw against and then account for so the float can be replenished. That is, almost word-for-word, what this product does: someone draws against company money, someone else reconciles it, the cycle repeats. It reads as a word a finance department would actually use, not a name assembled from SaaS-naming-generator syllables ("-ify," "-ly," "-io," compound-noun-plus-verb). It's short, it's ownable, and it gives the whole visual system something real to be *about* — see Section 1.

This is a from-scratch identity and IA, not a reskin. Nothing from the previous interface — its blue dashboard chrome, its card-grid layout, its generic status pills — carries forward except the underlying data model (expenses, approvals, budgets, departments), which this brief was written against directly so nothing here requires backend changes to implement.

---

## 0. WHAT IMPREST IS

A corporate expense-management product: employees submit expenses with receipts, those expenses route through an approval chain, and finance leads track department budgets against real spend. Three audiences, one product:

- **Submitters** — most employees. They want submitting an expense to take under a minute and to know where it stands without asking anyone.
- **Approvers** — team leads / managers. They want a queue that tells them what's urgent, what's routine, and what's actually worth reading closely, without reading every line of every receipt.
- **Finance leads** — the people who live in this tool. They want to see budget health at a glance, catch policy problems before they become a pattern, and never have to chase someone for a missing receipt.

Nobody in any of these three groups wants to feel like they're using "software." The best comparison in the room is a well-run finance department's actual paper trail — legible, exact, a little bit formal, never cold.

---

## 1. CREATIVE DIRECTION — read first, overrides default instincts

**The concept: THE FLOAT LEDGER.**

Imprest isn't styled as a fintech dashboard. It's styled as the physical instrument a disciplined counting house would use to track an imprest float: a bound ledger, a chequebook of tear-off counterfoils, a drawer of ink stamps for marking status. Every screen should look like it belongs to that world — precise, tactile, unmistakably about *real money moving through a real process* — not like a generic analytics product that happens to be about expenses.

**Three feelings every layout decision must serve:**
1. **Precision without coldness** — figures are exact, dates are exact, nothing rounds or hand-waves, but the surface is warm paper, not a cold data-grid.
2. **Legible authority** — a submitter should be able to read their own status at a glance; an approver should be able to read a queue at a glance. Clarity is the product's actual value proposition, not a nice-to-have.
3. **The paper trail is the interface** — every state change (submit, approve, reject, reimburse) should feel like it left a physical mark, not like a boolean flipped somewhere.

**Signature motifs — use these to escape the generic-SaaS-dashboard look:**

- **The Float Ring.** A circular ring, not a horizontal bar, is Imprest's one recurring shape for "a quantity against a boundary" — budget usage, an approval SLA countdown, even the user avatar's outer edge. It fills clockwise starting at 12 o'clock, the "reconciliation mark." This replaces every place a lesser product would reach for `<progress>`.
- **Counterfoil cards.** Every expense record is drawn as a torn/perforated counterfoil — like the stub you keep when you tear a cheque out of a chequebook. A die-cut perforation line (a dashed, slightly irregular edge — not a clean CSS `border-style: dashed`) separates the record half (merchant, amount, date) from the action half (status, next step). This is the single most identity-carrying component in the system.
- **Ink-stamp status marks.** Status never renders as a flat colored pill. It renders as a stamped mark — rotated 2–4°, slightly irregular opacity at the edges (a texture, not a filter gimmick), in the status's ink color. `SUBMITTED`, `APPROVED`, `REJECTED`, `CHANGES REQUESTED`, `REIMBURSED` each get their own stamp face (see 5.1, 7.3).
- **Folio numbers.** Every list/table screen carries a small running folio number in its bottom corner — "Folio 04 of 12" — monospace, low-opacity, exactly like a bound ledger's page number. Reinforces "this is a real ledger," costs nothing, and is a detail almost no AI-generated dashboard would think to include.
- **The reconciliation rule.** Wherever a running total is struck (subtotal → total, spent → remaining), use an actual double-underline beneath the final figure — real accounting notation — instead of a bold font-weight jump. Small, cheap, and instantly reads as "someone who understands bookkeeping designed this."

**Spatial rules:**
- Left-aligned, asymmetric compositions by default on marketing/editorial surfaces (Landing, About). The *application* surfaces (Dashboard, Expenses, Approvals, Budgets) are intentionally calmer and more grid-regular — see 1.1 below on where the line sits.
- No two adjacent marketing sections share the same structural skeleton.
- Vary container width per section: full-bleed dark interstitials, a narrow centered column for long-form copy, deliberate overflow on the hero's ledger illustration.

**Before finalizing any screen, answer in order:**
1. What's the structural skeleton of this screen (not its content)?
2. Would a screenshot with the wordmark cropped out still read as *Imprest* and not "generic finance SaaS #47"?
3. Is there a float ring, a counterfoil, a stamp, or a folio number doing real work here — or did I reach for a default card/table instead?
4. What does this screen look like empty, loading, and in error?
5. If the answer to #2 is "no" — redesign before finalizing.

**Explicitly avoid:** blue-and-white SaaS dashboard chrome, generic horizontal progress bars, flat rounded status pills, oversized soft-shadow floating cards, gradient hero blobs, generic empty-state illustrations (mascots, floating boxes), "Oops!" / "Something went wrong" copy, centered-everything layouts on marketing pages, a sidebar that looks identical to every other B2B tool's sidebar.

### 1.1 Where "editorial" ends and "operational" begins

This is the one deliberate tension in the system, and it should be documented so nobody "fixes" it later by mistake:

- **Marketing surfaces** (Landing, About, Help/Support index) get the full asymmetric, editorial treatment — this is where the brand sells itself.
- **Product surfaces** (Dashboard, Expenses, Approvals, Budgets, Submit Expense, Settings) keep the *materials* (paper tone, stamps, rings, counterfoils, folio numbers, Fraunces/Plex pairing) but use calmer, more predictable grids, because a finance lead processing 40 approvals in a sitting needs speed and scan-ability, not narrative surprise. Treat this the same way Savora's brief treats Admin: on-brand, not on-atmosphere.

---

## 2. EMOTIONAL BRIEF PER MOMENT

| Moment | Feeling |
|---|---|
| Landing page arrival | Being handed a well-kept ledger and immediately trusting the person who kept it |
| Submitting an expense | Filling out a form that respects your time — quick, exact, no ambiguity about what's needed |
| Waiting on approval | Knowing exactly where the item sits and what happens next — status without anxiety |
| Approving a queue | A clean desk, not a flooded inbox — triaged, prioritized, nothing buried |
| Budget review | A finance lead looking at a ledger they trust completely, not a dashboard they have to double-check |
| Getting reimbursed | The quiet satisfaction of a closed loop — the float, replenished |
| Rejection / changes requested | Being told exactly what to fix, in plain language, never blamed |
| Returning after time away | "Welcome back" — your drafts and history are exactly where you left them |

## 3. VISUAL REFERENCE POINTS

Counting-house and archive typography (ledger books, library card catalogs, museum object labels) · Field notebooks and chequebook counterfoils · Swiss/International Typographic Style precision (Emil Ruder, Josef Müller-Brockmann) for the grid discipline · Braun/Dieter Rams-era instrument panels for the "precise but warm" restraint · **Not** Stripe/Linear/Notion-style SaaS chrome — those are the default this brief exists to avoid.

---

## 4. DESIGN SYSTEM

### 4.1 Colors — with contrast verification

All pairs checked at their actual point size against WCAG AA (4.5:1 normal text, 3:1 large text ≥18px/14px-bold, 3:1 UI components/graphical objects). Ratios below are computed against the actual hex values in this table, not estimated.

| Role | Hex | Used on | Ratio | AA status | Note |
|---|---|---|---|---|---|
| Ink (primary text) | `#221E17` | `#F5F1E8` | 14.7:1 | Pass, all sizes | — |
| Ink (primary text) | `#221E17` | `#FFFFFF` | 16.1:1 | Pass, all sizes | On card surfaces |
| Muted text (light) | `#6E6558` | `#F5F1E8` | 5.1:1 | Pass, normal text | — |
| Muted text (dark canvas) | `#B7AC98` | `#1E1A14` | 7.7:1 | Pass, all sizes | Never use `#6E6558` on dark — locked rule |
| Brass — large/graphical only | `#A2672E` | `#F5F1E8` | 4.1:1 | Pass ≥18px / large-UI only | **Below 18px, use `#8C5726` instead — see rule below** |
| Brass-deep — text & fills | `#8C5726` | `#F5F1E8` | 5.3:1 | Pass, all sizes | Default for buttons, links, small labels |
| Brass-deep on white card | `#8C5726` | `#FFFFFF` | 5.8:1 | Pass, all sizes | — |
| Status — Approved | `#2F5D45` | `#F5F1E8` | 6.7:1 | Pass, all sizes | — |
| Status — Rejected | `#8A3626` | `#F5F1E8` | 7.1:1 | Pass, all sizes | — |
| Status — Pending/Submitted | `#93650F` | `#F5F1E8` | 4.5:1 | Pass, normal text (borderline) | Below 14px, use `#7A5209` (6.1:1) |
| Status — Reimbursed | `#2C5E6B` | `#F5F1E8` | 6.4:1 | Pass, all sizes | — |
| Status — Changes Requested | `#7A5209` w/ dashed stamp ring | `#F5F1E8` | 6.1:1 | Pass, all sizes | Shares hue with Pending-deep but always rendered with a **dashed** stamp ring so the two are never confused by color alone |
| Border | `rgba(34,30,23,0.12)` | `#F5F1E8` / `#FFFFFF` | — | N/A (non-text) | Decorative only, never load-bearing for state |
| Overlay/scrim | `rgba(30,26,20,0.6)` | photography/dark hero | — | N/A | — |

**On the brass rule:** exactly like Savora's red, this is Imprest's own internal buffer, not a WCAG correction. `#A2672E` technically clears 3:1 (the large-text/graphical threshold) comfortably and is fine for display numerals, icon fills, and the Float Ring's fill color. It is *not* used for body copy, table cell text, form labels, or anything under 18px — `#8C5726` covers all of that with real margin. Document this distinction in dev handoff so it reads as house style, not a bug fix.

**Rule going forward:** any new color usage not in this table gets checked before it ships, same as Savora/Noctra's rule. When in doubt, default to the "-deep" variant.

### 4.2 Typography

**Fonts:** Fraunces (display/editorial serif — has real personality in its italics and optical-size range, avoids the Cormorant/Playfair cliché) + IBM Plex Sans (UI/body — a hair more technical/drafting-table in character than the default-everywhere Inter) + IBM Plex Mono (money, dates, IDs, folio numbers — same type family as the UI font, so the mono layer feels engineered-in, not bolted on).

| Style | Font | Size | Weight | Notes |
|---|---|---|---|---|
| Display/Hero | Fraunces | clamp(48–88px) | 500, optical size "opsz" high | letter-spacing -0.01em, line-height 0.95 |
| Section headings | Fraunces | clamp(32–56px) | 500 | — |
| Pull statements | Fraunces Italic | clamp(18–24px) | 400 | Used sparingly — About page, empty-state copy |
| Item/merchant names | Fraunces | 18–22px | 500 | On counterfoil cards, table rows |
| Body/UI | IBM Plex Sans | 13–15px | 400 | line-height 1.7 |
| Labels/eyebrows | IBM Plex Sans | 10px | 500 | uppercase, letter-spacing 0.12em |
| **All monetary figures** | IBM Plex Mono | varies | 500 | **tabular numerals, no exceptions, anywhere money appears** |
| Folio numbers | IBM Plex Mono | 10px | 400 | tabular-nums, `#B7AC98` on dark / `#6E6558` on light |
| Timestamps / IDs | IBM Plex Mono | 11px | 400 | tabular-nums |

Eyebrow labels are preceded by a short brass-deep rule (20px, 1px thick). Folio numbers sit bottom-right of every list/table frame: `Folio 04 / 12`.

**Non-negotiable rule:** money is *always* set in IBM Plex Mono with tabular figures, in every context — table cells, stamped counterfoils, the Float Ring's center label, form inputs. A finance tool where the digits shift width as they change is a finance tool nobody trusts. This is Imprest's version of Savora's "never mix #78716C on dark" rule — small, easy to violate by accident, catastrophic for trust if it slips.

### 4.3 Grid system

**Desktop (1440px frame, 1280px max content width):** 12-column grid, 24px gutter, 5vw outer margin on marketing pages. Product pages use a simpler content frame: a 240px fixed sidebar + a 12-column grid within the remaining canvas, max content width 1120px, centered within the canvas.

**Marketing asymmetric compositions** (column-span fractions, never arbitrary pixel splits):
- Hero split (60/40 feel) → headline block spans 7 cols, float-ring illustration spans 5 cols
- About "curator's note" (55/45 feel) → copy spans 7 cols, marginal stamps/notes spans 5 cols

**Tablet (1024px):** 8-column grid, 20px gutter. Sidebar collapses to a top icon-rail (64px) on product pages.

**Mobile (390px):** 4-column grid, 16px gutter, 20px outer margin. Product pages: bottom tab bar replaces the sidebar entirely (see 6.1).

**Spacing tokens** (all values on this scale, 8px baseline rhythm): `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px`.

### 4.4 Icon system

Single-weight line icons, 1.5px stroke, rounded joins, square-ish corners (2px radius) to match the ledger/instrument feel rather than a soft rounded consumer-app look. Base set: Lucide, extended with custom marks for the two motif-specific glyphs that don't exist in any icon set — the **Float Ring** marker and the **Stamp** marker (used as tiny inline indicators, e.g. next to a status word in dense tables where a full stamp graphic would be too heavy).

Sizes: 16px (inline with body text), 20px (nav/table row actions), 24px (empty-state / stat-card icons). Touch target always 44×44px minimum regardless of icon size. Color inherits context text color; active/selected states use brass-deep, never the lighter graphical-only brass.

### 4.5 Asset & export spec

No photography anywhere in the product — this is a data tool, not a lifestyle brand, and stock "people in a modern office" photography is exactly the generic-SaaS tell this brief exists to avoid. All illustration is **flat vector line-art in the ledger/instrument style**: float rings, stamp marks, counterfoil diagrams, a simple isometric "drawer of receipts" motif reserved for empty states and the landing hero. Export as SVG component instances, no raster fallback needed. Receipts themselves (user-uploaded JPEG/PNG/HEIC/PDF) are the only real "photography" in the product — see 7.3 for the receipt-viewer treatment, including a designed non-stretching crop/preview frame consistent with the existing upload constraints (10MB max, JPEG/PNG/WEBP/HEIC/PDF).

### 4.6 Motion & micro-interaction language

- **The stamp-down.** On any status change (submit, approve, reject), the new stamp animates in with a quick, slightly heavy "press" — 180ms scale from 1.15→1.0 with a small overshoot, not a fade. This is Imprest's signature interaction, equivalent to Savora's cart-arc or Noctra's clip-path wipe.
- **The ring fills, it doesn't tick.** Float Ring animations are a smooth clockwise arc draw (400ms ease-out), never a numeric counter racing up — the ring *is* the number.
- Page/section reveals on marketing pages: fade up 12px, staggered 60–80ms.
- Product-surface transitions: instant or a simple 120ms cross-fade — this is a working tool, not a browsing experience (same principle as Savora's admin-wide rule).
- Reduced motion: opacity-only for all of the above, no exceptions.
- Loading: cream shimmer skeletons shaped to content (counterfoil-shaped skeletons on lists, ring-shaped skeleton on budget cards); spinner reserved only for the receipt-upload and payment-adjacent moments (submit, refund-equivalent actions).

---

## 5. ACCESSIBILITY REQUIREMENTS

- Focus-visible: 2px offset ring, brass-deep, on every interactive element — never the default browser outline.
- Contrast per the verified table in 4.1.
- Touch targets 44×44px minimum on all breakpoints, icon-only buttons included.
- Status is never color-only: every stamp carries a text label and, where a stamp is abbreviated to a small inline dot (dense tables), the dot is paired with a text status column that can be sorted/filtered — color plus text plus shape (solid vs. dashed ring) triples up so status is legible to colorblind users and to screen readers alike.
- Alt-text: uploaded receipts get user-entered or auto-suggested descriptive alt-text at upload time, not a filename dump.
- Motion-sensitive users: covered by the reduced-motion spec in 4.6.
- All rotated/stamped text (status stamps use a slight rotation, per 1) carries a plain, unrotated `aria-label` mirroring Noctra's fix for rotated index tabs — assistive tech should never be asked to parse a transformed text node.

---

## 6. COMPONENT SPECS

### 6.1 Navigation shell (product surfaces)
Fixed left sidebar, 240px, warm dark fill `#1E1A14` (not pure black — stays in the paper-and-ink world rather than going full "dark mode dashboard"). Holds: wordmark (small, Fraunces, no flourish — quiet, the way Savora keeps its admin wordmark quiet), then nav: **Dashboard, Expenses, Approvals** (hidden entirely for users with no approval permissions — never shown-but-disabled), **Budgets** (Finance Lead role only), **Settings**. Active item gets a brass-deep left border (3px) + subtle fill, exactly the pattern Savora uses for its admin sidebar, because it's a genuinely good, legible pattern for this kind of nav — reused deliberately, not by accident.
Top bar: paper `#F5F1E8`, holds page title (Fraunces, 24px), global search trigger, notification bell (with unread count on a small stamp-shaped badge, not a generic red dot), user menu (avatar inside a Float-Ring frame + name + role + logout).
**Mobile:** sidebar collapses to a 5-item bottom tab bar (Dashboard / Expenses / + New / Approvals-or-Budgets depending on role / Settings), with the "+ New Expense" action as a raised, brass-deep circular center tab — the one place a floating action button is earned, because submitting an expense fast is the product's single most common action.

### 6.2 Counterfoil card (the signature component)
Two halves divided by a perforated edge (SVG dash pattern, hand-irregular, not a CSS dashed border):
- **Record half** (left, ~65%): merchant name (Fraunces 18px), category + date (Plex Sans, muted), amount (Plex Mono, right-aligned within this half, largest numeral on the card).
- **Action half** (right, ~35%): the stamp (see 6.3), and a single primary action relevant to its state (Submitter sees "Edit" on a Draft, "View" on anything submitted; Approver sees "Review" on anything pending their decision).
Variants: Draft (unstamped — a visibly blank stamp outline, "not yet submitted," a deliberate empty-state-within-a-component), Submitted, Approved, Rejected, Changes Requested, Reimbursed. Hover: the perforation "tears" slightly further apart (2–3px gap increase, 150ms) — a small, cheap, delightful detail that reinforces the physical metaphor.

### 6.3 Stamp component
Rotated 2–4° (randomized per-instance within that range so a list of stamps doesn't look mechanically identical — subtle, not distracting), textured edge (a light noise/grain mask so it doesn't read as a flat colored shape), status color per 4.1, always paired with its text label inside the stamp face. `CHANGES REQUESTED` and `SUBMITTED` share a hue family but `CHANGES REQUESTED` renders with a **dashed** stamp ring instead of solid, so the two are distinguishable at a glance without reading the label. Small inline variant (a filled dot + 1-word label) used in dense table rows where a full stamp graphic would overwhelm the row.

### 6.4 Float Ring
SVG ring, fills clockwise from 12 o'clock. Two contexts:
- **Budget usage** (Budgets page, dashboard stat cards): ring shows spent/limit, center label is the remaining amount in Plex Mono, ring color shifts from brass (healthy) → pending-amber (>80% used) → rejected-red (over budget) — this color logic is the same success/warning/danger logic Savora uses for its live-availability signal, applied to Imprest's own shape language instead of borrowed wholesale.
- **Approval SLA** (Approvals queue): ring shows time remaining until an item's due date, same color logic, smaller scale, sits inline in the queue row rather than as its own card.

### 6.5 Forms
White card container on paper background, underline-style inputs (not boxed) for a closer match to the ledger-paper feel — label above, input below a single hairline rule that turns brass-deep on focus and rejected-red on error. Error copy is specific, never generic ("Enter an amount greater than $0" not "Invalid input"), matching the voice guide (Section 9). Validation timing: on blur for most fields, live for amount/date fields where immediate feedback prevents a wasted submit attempt.

### 6.6 Tables / list views
Ruled rows (thin hairline dividers, ledger-register style) rather than card-in-card nesting. Money columns right-aligned in Plex Mono. Status column uses the small inline stamp variant (6.3). Sortable column headers use a small monospace arrow, not a generic sort icon. Row hover: a very subtle paper-darkening (not a shadow lift — this isn't a floating-card system). Folio number bottom-right of every table frame.

### 6.7 Modals & drawers
Row-level detail (an expense, an approval decision, a budget) opens as a right-side drawer, never a full page navigation and never a centered modal for anything with more than 2 fields — mirrors Savora's "drawer, not new page" rule for admin order detail, applied consistently across Imprest's own equivalents. Centered modals are reserved for genuinely short, careful-confirmation actions only (see 6.9).

### 6.8 Toasts
Bottom-right, slide in, auto-dismiss with a visible progress rule (not a spinner) — success uses the approved-green stamp ink, error uses rejected-red, info uses brass-deep. Never used for anything that needs to persist past a page reload (irreversible confirmations get their own state, not a toast — see 6.9).

### 6.9 Careful-confirmation pattern (irreversible actions)
For deleting a draft, withdrawing a submitted expense, or an approver rejecting with no way to un-reject: small centered modal, plain-language consequence stated explicitly, a ghost "Never mind" and an **outline**-red (never filled-red) confirm button — deliberately no filled destructive default, so nothing gets confirmed by an accidental fast double-click. Same pattern Savora and Noctra both converge on independently for cancel-order/delete-account, because it's simply the correct pattern for this class of action.

### 6.10 Buttons
Primary: brass-deep fill, cream text, 4px radius (small, precise — not the oversized pill-radius of a consumer app). Secondary: outline, ink text. Ghost: text-only, used for the "matters least" tier of actions (Savora's own naming for this tier, borrowed because it's the right concept: promo-code-style low-emphasis actions). All buttons show loading (dot-pulse in the button, no separate spinner overlay) and disabled states as first-class variants.

---

## 7. ROLES & PERMISSIONS — closing a real gap

The current build has no role system — every request acts as the earliest-created user. This redesign specs the fix properly rather than leaving it implicit, the same way Savora's v6 closed its own admin-roles gap:

- **Submitter** (every user, baseline) — Dashboard, Expenses (own only), Submit Expense, Settings. No Approvals or Budgets nav items at all — not shown-disabled, simply absent, so the nav never implies access that isn't there.
- **Approver** — everything a Submitter has, plus **Approvals**: a queue scoped to their department(s). Can approve, reject, or request changes on items routed to them. Cannot edit budget limits.
- **Finance Lead** — everything an Approver has, plus **Budgets** (create/edit budgets, view all departments' spend), plus visibility into every department's expense and approval history, plus the reimbursement-marking action (see 8.8).
Role assignment itself lives in Settings → Team (Finance Lead only), a simple table: name, email, department, role dropdown — reuses the standard table component (6.6), not a bespoke admin-only design.

---

## 8. SITEMAP & SCREEN-BY-SCREEN SPEC

### 8.0 Full sitemap

```
Marketing (public, logged-out)
/                      Landing
/product               How it works (submit → approve → reconcile)
/about                 Brand / company page
/help                  Help & Support index
/help/[article]        Support article
/contact
/privacy  /terms

Auth
/login
/register
/forgot-password
/reset-password
/verify-email          (NEW — see 8.5)

Product (authenticated)
/dashboard
/expenses                        list, all statuses, filter + search
/expenses/new                    submit flow
/expenses/[id]                   detail drawer (own expense)
/approvals                       queue (Approver / Finance Lead only)
/approvals/[id]                  decision drawer
/budgets                         (Finance Lead only)
/budgets/[id]                    budget detail drawer
/notifications                   (NEW — see 8.9)
/settings/profile
/settings/team                   (Finance Lead only — role assignment)
/settings/notifications          (NEW — preference center)

System
/404
/500
Offline banner (state, not a route)
```

### Gaps this redesign closes (flagged inline below, mirroring the Savora/Noctra convention)

- 🔧 **Register / signup screen** — the current build has no self-serve account creation path at all.
- 🔧 **Forgot / reset password** — explicitly called out as missing in the project's own README. Fully specified below.
- 🔧 **Email verification** — new accounts have no verification step; added as a short, non-blocking interstitial.
- 🔧 **Expense detail view** — currently expenses only exist as list rows; there's no dedicated place to see one expense's full history (submitted → approved → reimbursed), its receipt, and its activity log entries.
- 🔧 **Approval decision screen** — approving/rejecting needs its own considered surface (with receipt visible alongside the decision, and a required comment on reject/changes-requested), not an inline row action.
- 🔧 **Notifications** — the schema already logs an activity trail (`activity_log`, with `tone: positive/negative/pending`); there was no UI surface for it. Now a first-class Notifications page plus a preference center.
- 🔧 **Global search** — no way to find a specific expense across a long history; added as a lightweight overlay (not a full page).
- 🔧 **Roles & Team settings** — see Section 7.
- 🔧 **Reimbursement action** — the schema has a `REIMBURSED` status but no specified screen/action that sets it; specified in 8.8.
- 🔧 **Empty / loading / error states** — none were designed for any flow; every screen below gets all three.
- 🔧 **Help & Support** — didn't exist; added as its own marketing-adjacent section since a finance tool without a help path generates support tickets by default.

### 8.1 Landing (marketing)

**Purpose:** convert a finance lead or ops lead evaluating expense tools. **Primary goal:** get them to register or book a walkthrough. **Layout:** asymmetric hero — left 60%: headline built from the float metaphor ("Every advance, accounted for." or similar — see Section 9 for tone), one line of supporting copy, primary CTA ("Start free") + secondary ("See how it works"). Right 40%: a large Float Ring illustration mid-animation-frame, with a small stamped "RECONCILED" mark near it, tilted, as if physically stamped onto the page — the hero's job is to teach the visual language in one glance.
Below the hero, sections alternate paper/dark exactly per the "no two adjacent sections share a structural skeleton" rule: a "How it works" 3-stage strip styled as a counterfoil chain (submit → approve → reconcile, each stage literally drawn as a torn counterfoil connecting to the next) → a dark interstitial with a large stat in Plex Mono ("$0 lost to expense-report chasing") → a role-based value section (three columns, but asymmetric — Submitter/Approver get standard columns, Finance Lead's column is visually dominant, 2x width, since that's the buyer) → trust/security note → footer.
**States:** none transactional here beyond the newsletter-adjacent CTA form (idle / submitting / success / already-registered), styled with the same stamp-confirmation language used everywhere else in the product.

### 8.2 About

Long-form single narrow column (~640px), Fraunces opening line, Plex Sans body. 2–3 marginal stamped notes floating beside paragraphs ("FOUNDED ON A REAL LEDGER PROBLEM" or similar), echoing Noctra's "curator's statement" pattern but in Imprest's own stamp language instead of Noctra's typewriter marginalia.

### 8.3 Help & Support

Paper page. Search field at top (large, serif placeholder "What are you trying to do?"). Below: category tiles ("Submitting expenses," "Approvals," "Budgets," "Account & billing") each linking to a filtered article list. Article page: single column, a "Was this helpful?" micro-interaction at the bottom (thumbs, optimistic, no page reload) instead of a generic feedback form. **Live chat / contact:** a persistent "Talk to us" trigger in the corner opens a drawer (6.7), not a new page, same as Noctra's contact-drawer pattern.

### 8.4 Login / Register / Forgot Password / Reset Password 🔧

Shared shell: dark canvas (`#1E1A14`), a narrow paper-card form floating centered — the one deliberate full-centering exception in the whole system, same principle Noctra uses for its auth shell (utility flow, not browsing, centering is *correct* here).
- **Login:** email + password, "Forgot password?" ghost link, primary submit, secondary "Create an account" link below a hairline divider.
- **Register:** name, email, department (dropdown, sourced from existing departments), password + confirm, terms checkbox (unchecked by default, required). On submit → Verify Email interstitial.
- **Forgot Password:** single email field, one-line copy, submit → in-place confirmation state ("Check your inbox — we've sent a reset link to [email]"), never navigates away.
- **Reset Password:** new password + confirm, inline validation on blur (min length, match check), success redirects to Login with a small success-stamp banner. Expired/invalid token: same page, form swaps for a calm message + "Request a new link" — never a generic browser error.

### 8.5 Verify Email 🔧 (new)

Same auth shell. A stamped "PENDING VERIFICATION" mark, one line of copy, "Resend email" ghost link with a 30-second cooldown. Non-blocking — dismissible, user can proceed into the product and verify later, with a small persistent (but not nagging) banner on the Dashboard until verified.

### 8.6 Dashboard

**Purpose:** the "what needs my attention right now" screen, role-aware.
- **Submitter view:** a stat row (this month's spend, expenses awaiting review, expenses needing action from them — e.g. changes requested) rendered as small Float Rings, not generic stat cards. Below: their most recent counterfoil cards (drafts + recently-changed status), and a prominent "+ New Expense" entry point.
- **Approver view:** adds a queue-preview module — top 3–5 items awaiting their decision, each showing its SLA Float Ring, with a "View all in Approvals" link.
- **Finance Lead view:** adds a budgets-at-a-glance strip — every department's Float Ring in a row, sorted by health (over-budget first), linking into Budgets.
**Empty state (new user, no expenses yet):** the isometric drawer-of-receipts illustration, one line ("Nothing filed yet.") + the New Expense CTA. **Loading:** ring-shaped and counterfoil-shaped skeletons matching the content they'll become.

### 8.7 Expenses (list)

Table/list view (6.6) with a filter bar above: status (multi-select chips, using the small stamp-dot visual so filter chips visually match the data they filter), department (Finance Lead/Approver only — submitters only ever see their own), date range, search. Changing any filter resets pagination to page 1 and scrolls the list back to its own top (not the page top) — same rule Noctra's brief specifies for its filtered grid, applied here because it's simply correct behavior anywhere filtering exists.
Sort: by date (default, newest first), amount, status. **Empty (zero results from filters):** "No expenses match these filters" + "Clear filters" ghost action. **Empty (genuinely no expenses):** same as Dashboard's empty state. **Loading:** counterfoil skeletons. Folio number bottom-right.

### 8.8 Expense detail 🔧 (new)

Right-side drawer (6.7), opened from any counterfoil card or table row. Top: merchant, amount (large, Plex Mono), date, category, cost center. The receipt, shown in a non-stretching crop-frame preview (per 4.5) with a "View full size" action opening it at native resolution. Below: a vertical activity timeline built from the existing `activity_log` data — each entry a small stamped tick (positive/negative/pending tone mapped directly to the schema's existing `tone` enum, so no new backend concept is invented) with its timestamp in Plex Mono. Actions available scale with status and role: Draft → Edit/Delete (careful-confirm) for the owner; Submitted → Withdraw (careful-confirm) for the owner, Approve/Reject/Request Changes for an approver; Approved → nothing further for the owner, "Mark Reimbursed" for a Finance Lead (see below); Rejected/Changes Requested → "Edit & Resubmit" for the owner, pre-filling the original form.
**Mark Reimbursed** (closes the schema's real gap — `REIMBURSED` exists as a status with no specified trigger): a Finance-Lead-only action on an Approved expense, opens a small confirmation (reimbursement date, optional reference number), on confirm the counterfoil re-stamps with the Reimbursed mark and the activity timeline gets a new positive-tone entry — this is Imprest's equivalent of Savora's explicit "Admin: Process Refund" action (16.9): a real state transition needs a real, confirmable screen, not an assumed background process.

### 8.9 Submit Expense (`/expenses/new`)

Single-column form (~640px, centered, echoes the auth-card's quiet precision — deliberate visual rhyme, not the asymmetric marketing layout). Fields, top to bottom: merchant, category (dropdown), amount + currency, date, cost center / department (auto-suggested from the user's own department, editable), description, receipt upload (drag-drop, shows the crop/preview frame immediately, accepts the existing JPEG/PNG/WEBP/HEIC/PDF up to 10MB, inline progress state during upload — never a silent wait), a policy-flag note if the amount trips a threshold (calm inline note, not a blocking error — "This is above the standard per-diem for [category]; it'll be flagged for a closer look, but you can still submit"). Two submit actions: **Save as Draft** (ghost) and **Submit for Approval** (primary, brass-deep). On submit success: the drawer/page closes with a stamp-down animation (4.6) and the new counterfoil appears at the top of Expenses with a brief "just submitted" highlight, then settles — same pattern Noctra uses for its "just added" review insert.

### 8.10 Approvals queue (Approver / Finance Lead)

Table view, default sort by SLA urgency (soonest-due first — the one place the product should actively surface urgency rather than staying neutral). Each row: submitter name, merchant, amount, department, the SLA Float Ring inline, a quick-decision affordance (Approve / Reject / Request Changes as three small icon actions) *and* a "Review" link into the full decision drawer — quick actions are for the confident, obvious cases; anything needing a real look opens the drawer. **Bulk approve** is deliberately NOT offered for Reject or Changes Requested (those always require the considered single-item flow with a comment), but IS offered for Approve on multi-select, since approving a batch of routine, policy-clean expenses is a real and frequent finance-lead task — checkbox multi-select + a "Approve selected (4)" bar that appears above the table.

### 8.11 Approval decision drawer

Same drawer as Expense Detail but opened from the approver's side: receipt shown prominently (this is the moment someone is actually deciding, so the receipt gets more visual weight here than in the plain detail view), submitter's description, any policy flag called out explicitly (not buried), and the three decision actions at the bottom — Approve (primary), Reject (outline-red, requires a reason field), Request Changes (outline-brass, requires a comment describing what's needed). Reason/comment fields are required, not optional, for both non-approve paths — mirrors the voice principle "never blame the guest, but always tell them what to fix," which only works if a reason is mandatory.

### 8.12 Budgets (Finance Lead)

Grid of Float Ring budget cards, one per department, sorted by health. Each card: department name, period, Float Ring (spent/limit), remaining amount in large Plex Mono, a small trend note ("On pace" / "Ahead of pace" / "Over pace" — plain language, not a sparkline nobody asked for). Clicking opens the Budget Detail drawer: the same ring larger, a reconciliation-rule total breakdown (per 1's "reconciliation rule" motif: line items summing with a real double-underline), and a list of the department's expenses feeding that total, reusing the Expenses list component filtered to that department/period. **Create/Edit Budget** (Finance Lead only): a form drawer, same component as Submit Expense's shell (6.5) — name, department, limit amount, period.

### 8.13 Notifications 🔧 (new)

A page, not just a bell-dropdown, because an activity log this rich deserves a real home. List view of the same `activity_log` entries surfaced per-user (their own expenses' status changes, plus — for approvers/finance leads — new items entering their queue), grouped by day, each rendered with its tone-mapped stamp-dot. Unread state = a small filled brass-deep dot beside the entry; opening the notification marks it read and deep-links to the relevant Expense/Approval detail drawer.
**Preference center** (`/settings/notifications`): event categories (New submission to review, Status changes on my expenses, Budget threshold warnings) each with Email/In-app toggle columns — reuses the same toggle-table pattern Savora specs for its own notification preferences, because it's the right pattern for this exact kind of settings screen, not a coincidence of copying.

### 8.14 Settings — Profile / Team

**Profile:** name, email (read-only or verified-change flow), department (read-only, changed only by a Finance Lead via Team), change-password (current + new + confirm, current-password-mismatch gets a specific field-level error, not a generic failure — same principle as Noctra's Change Password spec).
**Team** (Finance Lead only, per Section 7): table of all users — name, email, department, role dropdown, last active — the standard table component, no bespoke admin-only design needed.

### 8.15 Global search 🔧 (new)

Triggered from the top bar (icon or `/` keyboard shortcut). Overlay, not a page: dark scrim, a single large input, live-filtering results below grouped by type (Expenses / Approvals if applicable), each result row showing the counterfoil's key fields in miniature plus its stamp-dot. Empty state: "No matches — try a merchant name, amount, or date."

### 8.16 System states

- **404:** "This wasn't filed anywhere we can find." One CTA back to Dashboard (logged in) or Landing (logged out). No generic broken-robot illustration.
- **500 / server error:** calm, specific-as-possible copy, a "Try again" action, and — if the user was mid-submit on an expense — an explicit reassurance that nothing was charged/lost and their draft is safe, matching the voice guide's payment-failure principle even though this product has no literal payment step.
- **Offline banner:** thin dismissible bar, top of viewport, same restrained "system message" visual language Savora/Noctra both converge on for this exact component — not a blocking modal.

---

## 9. VOICE & MICROCOPY GUIDE

Precise, plain, quietly formal — the voice of a finance department that has never once lost a receipt. Say what happened and what to do next. Never blame the user for an error. Never use gamified or falsely enthusiastic language ("Nice job!", "You're crushing your budget!") — Imprest's register is closer to Savora's "maître d' voice" than to a consumer app's cheerleading, translated into a finance context: warm competence, not excitement.

| Moment | Sample copy |
|---|---|
| Draft saved | "Saved as a draft — pick it up anytime from Expenses." |
| Submitted | "Submitted for approval. You'll hear back within [SLA]." |
| Approved | "Approved. Reimbursement will follow your company's usual cycle." |
| Rejected | "This wasn't approved. [Approver]'s note: '[reason]' — you can edit and resubmit." |
| Changes requested | "A quick fix needed before this can move forward: '[comment]'" |
| Over budget flag | "This is above the standard threshold for [category] — it'll be flagged for a closer look, but you can still submit it." |
| Empty expenses | "Nothing filed yet." |
| 404 | "This wasn't filed anywhere we can find." |
| Offline | "You're offline — changes will save once you're back." |

---

## 10. FIGMA DELIVERABLE EXPECTATIONS

- Desktop frames (1440px) primary; tablet (1024px) for Landing, Dashboard, Expenses, Approvals at minimum; mobile (390px) for all product screens plus Landing.
- Build the token layer first (Section 4) as Figma Variables before any screen.
- Reusable component library built before screens: Counterfoil card (all status variants), Stamp (all statuses, both full and inline-dot sizes), Float Ring (budget + SLA variants), buttons (all states), form fields (all states), sidebar nav item, table row, toast, drawer shell, careful-confirmation modal.
- Every screen designed with its empty, loading, and error state as separate named frames — not assumed.
- File structure:
```
01 — Brand Identity
02 — Design Foundations (color, type, grid, icon, motion tokens)
03 — Components
04 — Patterns (Counterfoil, Stamp, Float Ring, drawers)
05 — Desktop Screens (Marketing, Auth, Product)
06 — Tablet Screens
07 — Mobile Screens
08 — Prototype / User Flows
```
Frame naming: `[Section] / [Screen] / [Breakpoint]` — e.g. `Product / Approvals — Decision Drawer / Desktop`.

---

## 11. DEV / DESIGN HANDOFF CHECKLIST

- [ ] All colors verified against 4.1's contrast table; brass small-text rule documented as house style, not a WCAG patch
- [ ] Money is set in IBM Plex Mono with tabular numerals everywhere, no exceptions
- [ ] Float Ring used for every "quantity against a boundary" — no generic progress bars anywhere
- [ ] Counterfoil card is the one component for representing an expense record — no duplicate/competing card design exists elsewhere
- [ ] Every status has its own stamp face; Submitted vs. Changes Requested distinguishable by ring style (solid/dashed), not color alone
- [ ] Folio numbers present on every list/table frame
- [ ] Rotated/stamped text carries a plain-text aria-label
- [ ] Roles (Submitter / Approver / Finance Lead) gate nav items by absence, never by disabled-but-visible
- [ ] Register, Forgot/Reset Password, Verify Email all designed, including expired-token and already-verified states
- [ ] Expense Detail and Approval Decision exist as their own drawers, distinct from each other in emphasis (receipt weight, actions available)
- [ ] Mark Reimbursed exists as its own explicit, confirmable Finance-Lead action — not an assumed background transition
- [ ] Notifications has both a real page (not just a dropdown) and a preference center, mapped to the existing activity-log tone field
- [ ] Global search overlay designed with empty state
- [ ] Careful-confirmation pattern (outline-red, no filled destructive default) used for every irreversible action: delete draft, withdraw submission, reject, request changes
- [ ] Every screen has a designed empty, loading, and error state
- [ ] Marketing surfaces use the full asymmetric treatment; product surfaces stay calmer and grid-regular — documented as an intentional split, not an inconsistency
- [ ] System copy follows the Section 9 voice guide — no generic "Oops!" or gamified language anywhere
