## Context

Web’s dashboard **Athlete Profile** card (`AthleteProfileCard.vue`) shows identity (flag, name, age), Sync, HR thresholds (Max / Resting / LTHR), plus other modules. The **generated AI text** lives on `/profile/athlete` as a `Report(type=ATHLETE_PROFILE)` with rich `analysisJson` (executive summary, fitness/recovery/nutrition sections, 1–10 scores). Sync calls `POST /api/profile/generate` and a Trigger.dev job fills the report.

Mobile `app/(app)/athlete.tsx` is metrics edit only (`GET/PATCH /api/profile`). Reports and generate endpoints today use **cookie `getServerSession`**, not Bearer — companion cannot read AI text or Sync until coach-wattz migrates those routes.

Related Today changes (`today-wellness-overview`, `today-training-load-form`) intentionally do **not** absorb this identity/AI report surface.

## Goals / Non-Goals

**Goals:**

1. Athlete screen shows identity header + Max HR / Resting HR / LTHR (web widget parity for that strip).
2. Show latest AI Athlete Profile **executive summary** and score chips when Bearer reports API is available.
3. Sync regenerates the profile when Bearer generate is available; poll until COMPLETED/FAILED; handle 429 quota.
4. Open web → `/profile/athlete` for the full report (and as fallback when Bearer AI APIs are not ready).
5. Preserve existing metrics editor; do not port full Profile Settings.

**Non-Goals:**

- Porting Training Load / Wellness / Core Performance / Hydration modules from the dashboard card (separate changes).
- Full multi-tab AI report page, share modal, historical date picker (Open web).
- Metric-visibility settings modal.
- Placing this mega-card on Today’s first viewport.

## Decisions

### 1. Destination: enhance Athlete (More), not Today

**Decision:** Primary surface is More → Athlete. Rename affordance to **Athlete profile** (or keep “Athlete” with subtitle). Do not add another Today dashboard header — keeps morning composition decision-first.

**Alternative:** Today profile glance. Rejected for v1 of this change; can add a thin teaser later that deep-links to Athlete.

### 2. Phased delivery behind API readiness

| Phase | Mobile ships | Depends on |
|-------|--------------|------------|
| A | Identity + HR trio + Open web to `/profile/athlete` | Existing `profile:read` (`GET /api/profile` and/or dashboard) |
| B | AI executive summary + scores (read) | coach-wattz: Bearer `GET /api/reports?type=ATHLETE_PROFILE&limit=1` (+ scope) |
| C | Sync + poll | coach-wattz: Bearer `POST /api/profile/generate` + reports poll |

**Decision (locked):** Spec and tasks include A–C. Implementation MAY ship A immediately; B/C gate on backend. UI MUST NOT show a dead Sync that 401s without explanation — hide Sync or route to Open web until generate is Bearer-ready.

### 3. coach-wattz auth migration

**Decision:** Ask coach-wattz to switch:

- `GET /api/reports` and `GET /api/reports/[id]` → `requireAuth` with a read scope (prefer new `report:read`, or document if folded into `profile:read`).
- `POST /api/profile/generate` → `requireAuth` with write scope (`profile:write` is plausible since it updates user score fields; confirm in backend PR).

Mobile adds the agreed scope(s) to `COMPANION_SCOPES`. Prefer not inventing a mobile-only BFF if reports GET is sufficient.

**Alternative:** New `GET /api/mobile/athlete-profile` aggregate. Rejected unless reports migration stalls; violates thin-client preference.

### 4. AI content depth on mobile

**Decision:** Show:

- `executive_summary` (primary narrative)
- Score chips from `athlete_scores` (or User-cached score fields if exposed on profile/dashboard)
- Optional collapsible: `current_fitness.status_label` + `recommendations_summary`

Everything else → Open web. No share/print.

### 5. Identity fields

**Decision:** Name from auth/profile; country → flag emoji (port web helper or simple map); age from `dob` client-side or dashboard `age`. Resting HR may come from profile or latest wellness/dashboard — prefer profile/dashboard fields web already uses (`restingHr`, `maxHr`, `lthr`).

### 6. Sync UX without Trigger sockets

**Decision:** On Sync success (PENDING report id or accepted): poll `GET /api/reports?type=ATHLETE_PROFILE&limit=1` every few seconds with backoff until `COMPLETED` / `FAILED` / timeout (~2–3 min UI cap; job may run longer — then “still generating, pull to refresh”). Disable Sync while generating. On 429 show quota message + Open web.

### 7. Relationship to metrics editor

**Decision:** Screen layout top → bottom: overview (identity, HR readouts, AI block, Sync) → existing editable metrics form → Open web. Editing Max/LTHR still via form; overview readouts refresh after save.

## Risks / Trade-offs

- **[Cookie-only reports today]** → Phase A without AI; explicit backend dependency; no fake Sync.
- **[Scope / re-login]** → Document; fail closed on 403.
- **[Long generate jobs]** → Poll + timeout copy; Open web as escape.
- **[Report payload size]** → Map only needed `analysisJson` fields client-side.

## Migration Plan

1. coach-wattz PR: Bearer reports + generate (+ scopes on public OAuth client).
2. Mobile Phase A: identity + HR + Open web on Athlete; More label tweak.
3. Mobile Phase B/C: reports client, summary UI, Sync poll, scopes.
4. Update open-questions / oauth-setup docs.
5. Rollback: hide AI/Sync blocks; metrics editor remains.

## Open Questions

1. Exact OAuth scope names for reports read vs generate (`report:read` vs `profile:read` only) — confirm with coach-wattz REST_OAUTH_SCOPES.
2. Whether dashboard already exposes cached fitness scores on `GET /api/profile` / dashboard sufficient for chips without reports GET — prefer reports for narrative text regardless.
3. Flag rendering library/helper — reuse a tiny country→emoji map from web if license-clean; else show country code.
