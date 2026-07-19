## Why

On web, the dashboard **Athlete Profile** widget shows who the athlete is (flag, name, age), core HR thresholds (Max HR / Resting HR / LTHR), a **Sync** control to regenerate the AI athlete profile, and a path into the generated profile report. Mobile today only has a metrics editor (`Athlete` from More) with no identity header and no access to the AI narrative athletes already see on `/profile/athlete`. Closing that gap lets the field companion surface “who I am / how Coach Watts sees me” without porting the full dashboard card or Profile Settings.

## What Changes

- Add an **Athlete Profile overview** on the existing Athlete destination (More → Athlete): identity header (country/flag when available, name, age), read-out of Max HR / Resting HR / LTHR, and the **latest AI Athlete Profile** summary (executive summary + key score chips when present).
- Add **Sync** (regenerate AI profile) with generating/pending/quota UX when Bearer APIs are available; otherwise show an honest Open web escape instead of a broken button.
- Tap through / expand to read more of the AI report sections that fit a companion sheet (fitness status, recommendations summary); full multi-section report remains **Open web** → `/profile/athlete`.
- Keep metric **edit** (weight/FTP/HR) as the existing Athlete editor below or behind the overview — no second settings surface.
- **coach-wattz dependency (required for AI + Sync):** migrate `GET /api/reports*` (at least `type=ATHLETE_PROFILE`) and `POST /api/profile/generate` from cookie `getServerSession` to Bearer `requireAuth` with appropriate scopes (e.g. `report:read` / `profile:write` or documented equivalents). Until that lands, mobile ships identity + HR from existing `GET /api/profile` / dashboard and Open web for AI/Sync.
- Out of scope: dashboard mega-card modules already covered elsewhere (Training Load, Wellness overview, Core Performance FTP grid), metric-visibility settings modal, full report page port, Trigger.dev sockets (use poll).

## Capabilities

### New Capabilities

- `athlete-profile-overview`: Identity header, HR threshold glance, latest AI Athlete Profile summary/scores, Sync when Bearer-backed, Open web escape for the full report.

### Modified Capabilities

- `athlete-profile-edit`: Athlete destination SHALL present the profile overview (identity + AI summary) in addition to editable core metrics, without becoming full Profile Settings.
- `account-more`: More → Athlete entry copy/affordance MAY clarify that Athlete includes profile overview / AI summary (not metrics-only), if current labeling is misleading.

## Impact

- UI: extend `app/(app)/athlete.tsx` and/or split overview components under `src/features/profile/`; optional sheet for longer AI sections.
- Data: reuse `GET /api/profile` (+ optionally `GET /api/profile/dashboard` for staleness / resting HR); new reports client once Bearer-enabled; generate + poll for Sync.
- Auth: likely new `report:read` (or reuse documented scope) in `COMPANION_SCOPES`; re-auth for existing sessions.
- **coach-wattz:** Bearer enablement for reports list/detail and profile generate is a hard dependency for AI text + Sync; track as a paired backend change.
- Does not replace `today-wellness-overview` or `today-training-load-form` — those stay on Today; this lives on Athlete / More.
