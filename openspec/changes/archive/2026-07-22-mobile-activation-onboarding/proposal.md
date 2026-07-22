## Why

Day-one athletes who never open the web app hit a pile of empty Today/Log surfaces and churn. Product repositioned the companion as an **activation companion**: accounts must be creatable and soft-activated entirely on device (goal → plan → insight), with data connect last so Strava/Intervals login confusion does not block the door. The baseline and Phase 5 plan exist; this change is the implementation contract.

## What Changes

- Add a **server-driven activation wizard** after auth: consent → goal lite → plan lite → first insight → connect data (last; Skip OK).
- Support **mobile-only accounts**: sign-up copy on the OAuth path; native consent via existing Bearer `POST /api/user/consent`; gate incomplete soft-activation away from the normal tab shell (resume wizard).
- Add **goal lite** (create/edit primary goal; optional AI suggest/accept) and **plan lite** (availability + volume → initialize → first-week preview → activate) — not PlanDashboard / adapt / replan.
- Replace stacked Today empties for incomplete / soft-activated athletes with a **Finish setup** / resume surface until fully activated.
- **Connect last:** prefer Health Sync; secondary Connected Apps lite; Skip → soft-activated companion.
- **coach-wattz:** extend `onboarding-status` for goal/plan/insight/soft vs full activation; Bearer on plan initialize + activate; add REST `plan:write` (today only `plan:read` exists); align Official Mobile App scopes (`goal:write`, `plan:write`).
- Soft vs full activation analytics events (no health metric values).
- Docs already repositioned; keep them in sync as APIs land. Closes the spirit of [issues/056](../../docs/issues/056.md).

## Capabilities

### New Capabilities
- `activation-onboarding`: Wizard shell, consent step, soft/full activation gating, resume from onboarding-status, connect-last step, Finish-setup Today surface.
- `goal-lite`: Primary goal capture/edit (and optional AI suggest) for activation and More/Athlete ongoing edit.
- `plan-lite`: Native lite plan kickoff (availability/volume → initialize → preview → activate).

### Modified Capabilities
- `oauth-pkce`: Request `goal:write` and `plan:write` (once REST allowlisted); clarify sign-up vs sign-in as the same PKCE path with activation follow-up.
- `app-shell`: Authenticated shell MAY route into the activation wizard instead of tabs when soft activation is incomplete.
- `today-home`: Incomplete/soft-activated Today MUST prefer Finish-setup / provisional plan over a column of empty section cards; Analyze Readiness remains available when appropriate after soft activation.

## Impact

- **Mobile:** new activation feature module + routes; goal/plan feature modules; auth scope list; app layout gate; Today Finish-setup card; depends on Health Sync + Connected Apps lite for the connect step (compose, do not reimplement).
- **coach-wattz (required):** onboarding-status step model; Bearer plan initialize/activate + `plan:write` REST scope; web conversion definitions aligned for soft vs full activation. Consent + goals APIs already Bearer-capable.
- **Out of scope:** full PlanDashboard / adaptation wizard; native provider OAuth (handoff via Connected Apps lite); analytics explorer; replacing web setup hub entirely (shared status only).
- **Related open changes:** `connected-apps-lite`, `health-platform-ingest` / `-v2` — activation consumes them at connect-last; does not block soft activation if those are unfinished (Skip + provisional copy).
