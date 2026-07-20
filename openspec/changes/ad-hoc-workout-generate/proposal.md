## Why

Athletes can generate a custom **Ad-Hoc Workout** for today on web (`Generate Ad-Hoc Workout` → `POST /api/workouts/generate`), but the companion has no field path for that — only planned sessions already on the calendar and today’s recommendation Accept. When there is no suitable plan (or the athlete wants a one-off Ride/Run/Swim/Strength session), they are forced into the browser.

## What Changes

- Add a **Generate Ad-Hoc Workout** entry on Today (secondary when a recommendation/planned hero exists; available from planned-only / empty-adjacent states when product allows — prefer parity with web’s training card “New ad-hoc” affordance).
- Present a compact form sheet matching web’s modal: activity type (Ride / Run / Swim / WeightTraining), duration (minutes), intensity (Recovery → Anaerobic), optional instructions/focus notes; primary **Generate Workout**.
- Wire to `POST /api/workouts/generate` with Bearer auth; show generating / quota (429) / failure states; on completion refresh Today / planned workout so the new session appears.
- **coach-wattz:** migrate `POST /api/workouts/generate` from session-cookie-only (`getServerSession`) to `requireAuth` + scopes (`workout:write` preferred; confirm Official Mobile App). Expose a status/poll path if web relies only on realtime task events — mobile needs an honest completion signal (reuse task status pattern or refetch planned-for-today).

## Capabilities

### New Capabilities

- `ad-hoc-workout`: Form + generate mutation + generating/quota/error UX for ad-hoc planned workouts created from Today.

### Modified Capabilities

- `today-home`: Today MAY offer Generate Ad-Hoc Workout as a secondary action without displacing Accept / Analyze Readiness primary decisions.
- `today-data` or activity planned helpers: Client mutation + refresh of today’s planned workout after ad-hoc generation completes.
- `oauth-pkce`: Document that ad-hoc generate requires `workout:write` (already in companion scope list) once the endpoint is Bearer-ready.

## Impact

- **watts-mobile:** Today CTAs, new sheet under `src/features/today/` (or activity), API helper, polling/refetch, quota messaging.
- **coach-wattz:** Bearer on `POST /api/workouts/generate`; quota operation `generate_structured_workout`; optional status endpoint if task-run events are web-only today.
- **Out of scope:** Full workout library editor, structure editor, Garmin push settings UI, inventing intervals beyond what the ad-hoc job returns, recommendation Refine/Details (separate change).
