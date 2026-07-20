## Context

Web’s dashboard **Training Load & Form** section opens `TrainingLoadModal` → `PMCChart`: summary cards for Fitness (CTL), Fatigue (ATL), Form (TSB), Avg TSS, period selector, and a Chart.js PMC line series. Data: `GET /api/performance/pmc?days=` requiring scope **`performance:read`**.

Mobile Today has no CTL/ATL/TSB surface. Product baseline forbids CTL grids / heatmaps in the **first viewport**, but lists “weekly glance (load/form lite)” as later companion work — this change is that glance, with the chart deferred to a sheet.

`COMPANION_SCOPES` today does **not** include `performance:read`; athletes must re-consent after the scope is added.

## Goals / Non-Goals

**Goals:**

1. Compact Training Load & Form glance on Today: CTL, ATL, TSB (+ form status label/color from API summary).
2. Tap glance → **Training Load & Form** page sheet with summary cards, period chips (30 / 60 / 90), and a simplified PMC line chart (CTL/ATL/TSB).
3. Open web → instance `/performance` for full analytics.
4. Glance below decision CTAs; chart never on the first viewport.
5. Add `performance:read` to companion OAuth scopes.

**Non-Goals:**

- Full Performance analytics explorer, AI performance scores hub, TSS encyclopedia modals beyond a one-line CTL/ATL/TSB tip.
- Recovery-context chart overlays (`/api/recovery-context`) in v1 (optional follow-up).
- YTD / 180-day periods in v1 (can add later; default 90 like web body copy).
- Editing activities or recalculating PMC on device.
- New BFF.

## Decisions

### 1. Glance content (lite, not a grid)

**Decision:** One compact row/card: three values (Fitness / Fatigue / Form) with Form’s `formStatus` + `formColor` as the primary status cue. Optional small Avg TSS. No sparkline on the glance.

**Alternative:** Form-only chip. Rejected — athletes expect the CTL/ATL/TSB trio from web.

### 2. Placement on Today

**Decision:** Place below primary CTAs, near Recent Wellness / Active Recovery / week strip — after wellness glance when both exist. Must not sit above the recommendation hero.

### 3. Scope: add `performance:read`

**Decision (locked):** Append `performance:read` to `COMPANION_SCOPES`. Document that existing sessions need re-auth (or silent scope upgrade if IdP supports incremental auth — assume re-login for companion). Confirm the public OAuth client allows this scope in coach-wattz.

**Alternative:** Proxy PMC through a mobile BFF under an existing scope. Rejected — invents API surface; violates “don’t invent endpoints.”

### 4. Sheet + chart tech

**Decision:** `Modal` `pageSheet` titled “Training Load & Form”. Chart via existing SVG/path approach used elsewhere in the app (or a thin polyline helper) — **do not** add Chart.js. Series: CTL, ATL, TSB only. Period state local to the sheet; refetch PMC when period changes.

Default period: **90** days (web modal default).

### 5. Empty / no fitness data

**Decision:** If summary is missing or “No Fitness”, still show the glance with honest zeros/status from API (`formStatus`), and sheet explains that PMC needs activities with TSS. Do not hide the section entirely unless the query hard-fails — then quiet unavailable state that does not block Today.

### 6. Open web escape

**Decision:** Primary secondary action in sheet footer: Open web to `{instance}/performance` (path parity with web modal CTA). No in-app performance stack screen.

### 7. Prefetch

**Decision:** Glance uses PMC with a short default window (e.g. `days=30` or `days=90`) only for `summary` cards — one query is fine. Sheet reuses cache when period matches; otherwise new query key.

## Risks / Trade-offs

- **[Scope gap / re-login]** → Call out in More/settings or login copy if PMC 403s; fail glance quietly.
- **[First-viewport density]** → Keep glance one row; chart sheet-only.
- **[PMC payload size for 90d]** → Acceptable for v1; if slow, default glance to `days=30` summary-only and load 90 in sheet.
- **[Chart fidelity vs web]** → Simplified lines OK; legend + form color on TSB card required.

## Migration Plan

1. Add `performance:read` to scopes; confirm IdP client.
2. PMC client + types + form-status mapping tests.
3. Glance on Today; sheet with period + chart.
4. Update product-baseline / open-questions (load/form lite now in companion).
5. Rollback: remove glance/sheet; scopes can remain (harmless).

## Open Questions

1. Does the hosted OAuth public client already allow `performance:read` for the mobile client id? Confirm in coach-wattz before TestFlight.
2. Include Avg TSS on the glance or only in the sheet? Default: **sheet only** to keep the glance lighter.
