## Why

Session detail on mobile already covers the lite companion bar (planned structure, AI, charts, route map), but the highest-value field actions still require web: mark complete/skip, see plan adherence after a ride, jump between planned ↔ completed, ask Coach about *this* session, glance fueling prep, and skim richer metrics / strength sets. Closing that gap keeps the daily athlete loop on-device without porting the control-room explorer.

## What Changes

- **Planned compliance actions** — Complete and Skip on planned workout detail (distinct from recommendation Accept/Rest), using existing complete API and resolving skip/miss shape with coach-wattz (open question #18).
- **Plan adherence glance** on completed activity detail — score + short summary when `planAdherence` is present; link to the planned workout; Analyze/Regenerate adherence stays out of scope (Open web or later).
- **Session → Coach handoff** — “Discuss with Coach” from planned and activity detail with session-scoped seed context (title, type, date, key metrics / adherence snippet), reusing Coach room policy.
- **Linked session navigation** — From completed activity → linked planned detail when `plannedWorkoutId` / adherence link exists; from planned → linked completed activity when the server exposes a completed link.
- **Fueling prep glance** on planned detail when nutrition tracking is enabled — compact prep from `GET /api/workouts/planned/:id/fueling` (or documented equivalent); strategy override and full NutritionPrepCard stay web / Log.
- **Richer summary metrics** on activity detail — add present-only fields already on `GET /api/workouts/:id` (e.g. cadence, calories, VI, EF, max HR/power) without inventing values or loading streams.
- **Completed strength exercises** — show exercise list from workout `exercises` when present (sets/reps/load/RPE lite), mirroring planned strength summary shape.

Non-goals (stay web): structure edit, publish/export, map explorer / GPX, interval audit, advanced analytics tiles, share/compare, notes editor, duplicate version management.

## Capabilities

### New Capabilities
- `planned-compliance`: Complete / Skip (and honest status refresh) on planned workout detail; distinct from recommendation mutations.
- `activity-plan-adherence`: Lite plan-adherence glance on completed activity detail (score, summary, open planned).
- `session-coach-handoff`: Navigate from planned/activity detail into Coach with session-scoped seed context.
- `planned-fueling-prep`: Read-only fueling prep glance on planned detail when nutrition tracking is on.

### Modified Capabilities
- `upcoming-planned`: Planned detail gains compliance CTAs and optional fueling/Coach handoff entry points (structure summary requirements unchanged).
- `recent-activity`: Activity summary gains richer present-only metrics, completed strength exercises, linked planned navigation, and adherence glance entry.
- `coach-chat`: Allow session-scoped seed when chat is opened from a workout/activity detail handoff (in addition to Today/recovery seed).

## Impact

- **Mobile screens:** `today/planned/[id]`, `today/activity/[id]`; Coach navigation / seed helpers; possibly Today planned-only hero CTAs for parity.
- **Mobile modules:** `src/features/activity/*` (API, mappers, types, queries/mutations), `src/features/coach/seedContext` + navigation params, nutrition feature flag gate.
- **coach-wattz (required pairing):**
  - Confirm Bearer + scopes on `POST /api/planned-workouts/:id/complete`.
  - Resolve skip/miss (`PATCH` `completionStatus` vs dedicated endpoint) — open question #18.
  - Confirm `planAdherence` (+ `plannedWorkoutId`) on Bearer `GET /api/workouts/:id`.
  - Confirm completed↔planned link fields and `exercises` on workout detail for mobile.
  - Confirm Bearer on `GET /api/workouts/planned/:id/fueling` (or document the intended nutrition prep read).
- **Docs:** Update `docs/open-questions.md` when skip shape lands; product-baseline session-detail bullets for compliance / adherence / fueling glance.
- **Out of scope deps:** No new native modules; no explorer/GPX/interval ports.
