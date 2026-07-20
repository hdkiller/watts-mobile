## 1. API contract spike (coach-wattz)

- [x] 1.1 Confirm Bearer + scopes on `POST /api/planned-workouts/:id/complete` and document response fields (including any linked `workoutId`)
- [x] 1.2 Resolve skip/miss shape (`PATCH completionStatus` vs dedicated endpoint); land minimal coach-wattz change if needed; update `docs/open-questions.md` #18
- [x] 1.3 Confirm `planAdherence`, `plannedWorkoutId`, and `exercises` on Bearer `GET /api/workouts/:id?includeStreams=false`
- [x] 1.4 Confirm planned→completed link field on `GET /api/planned-workouts/:id` (or document absence)
- [x] 1.5 Confirm Bearer on `GET /api/workouts/planned/:id/fueling` (or switch to `requireAuth`) and required scope

## 2. Types, mappers, and API client

- [x] 2.1 Extend activity/planned types for adherence, exercises, compliance mutations, fueling prep, and linked ids
- [x] 2.2 Map `planAdherence` + completed `exercises` + expanded summary metrics (cadence, calories, max HR/power, VI, EF) present-only
- [x] 2.3 Add API helpers + TanStack mutations/queries for complete, skip, and fueling prep; invalidate Today / upcoming / planned / activity keys
- [x] 2.4 Unit tests for new mappers (adherence, exercises, metrics, fueling glance)

## 3. Planned compliance UI

- [x] 3.1 Add Complete (and Skip when contract ready) to planned detail with confirm + error/retry
- [x] 3.2 Mirror Complete/Skip on Today planned-only hero
- [x] 3.3 Show linked completed activity entry when server provides workout id
- [x] 3.4 Manual QA: complete, skip, already-terminal states, offline/error

## 4. Activity debrief upgrades

- [x] 4.1 Render plan adherence glance + View plan → in-app planned detail
- [x] 4.2 Render completed strength exercises section when present
- [x] 4.3 Show expanded present-only summary metrics in existing compact layout
- [x] 4.4 Manual QA: adherence ready/pending/absent; strength vs endurance; metrics omit empty

## 5. Session Coach handoff

- [x] 5.1 Add Discuss with Coach actions on planned and activity detail
- [x] 5.2 Implement session seed builder + Coach query-param handoff (reuse room policy)
- [x] 5.3 Unit tests for session seed (identity present, no invented prescription, display strip)
- [x] 5.4 Manual QA: handoff from both details; Today discuss still works

## 6. Fueling prep glance

- [x] 6.1 Gate on `nutritionTrackingEnabled`; lazy-fetch fueling for planned id
- [x] 6.2 Render compact read-only Fueling prep section; omit on null/error; no strategy override
- [x] 6.3 Manual QA: tracking on/off, plan present/null, Bearer failure soft-omit

## 7. Docs and baseline

- [x] 7.1 Update `docs/product-baseline.md` session-detail bullets for compliance, adherence, fueling glance, Coach handoff
- [x] 7.2 Record skip decision in `docs/open-questions.md` decision log when landed
