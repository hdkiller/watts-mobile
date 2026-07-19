## 1. Activity data layer

- [x] 1.1 Confirm workout list DTO fields for sync/analysis status in coach-wattz
- [x] 1.2 Confirm planned list query params + planned detail Bearer/`workout:read` (fix in coach-wattz if session-only)
- [x] 1.3 Confirm planned structure/interval fields for mobile summary (document if secondary endpoint needed)
- [x] 1.4 Add `src/features/activity` types, recent list fetch (`limit` capped), upcoming planned fetch (date window + limit), detail helpers
- [x] 1.5 Wire TanStack Query for recent list, upcoming list, activity detail, planned detail

Findings: see [api-findings.md](./api-findings.md).

## 2. Activity / upcoming UI

- [x] 2.1 More → Recent activity list with empty/loading/error
- [x] 2.2 More → Upcoming planned list with empty/loading/error
- [x] 2.3 Row status mapping for recent (honest unknowns)
- [x] 2.4 Lite activity summary stack + Open web escape hatch
- [x] 2.5 Deepen planned detail: structure/interval summary when available + Open web escape

## 3. Verify

- [x] 3.1 Typecheck + unit tests for status / planned structure mappers
- [x] 3.2 Manual smoke against local workouts + planned-workouts
- [x] 3.3 Update implementation-plan / product baseline notes if entry point differs

Entry point matches baseline: More → Recent activity + Upcoming (no product-baseline change required).

**3.1 notes:** `pnpm exec vitest run src/features/activity` — 10/10 passed. No type errors in activity / new routes. Repo-wide `pnpm typecheck` still fails on unrelated `src/features/coach` + `src/features/notifications` (out of this change’s ownership).

**3.2 Manual smoke (leave unchecked until run):**
1. Start coach-wattz on `http://localhost:3099` with an athlete account that has recent workouts + upcoming planned.
2. Confirm Bearer fix deployed: `GET /api/planned-workouts/:id` with mobile OAuth token returns 200 (not 401 session-only).
3. In the app: More → Recent activity → see capped list + status labels → open a row → summary + “Open in Coach Watts”.
4. More → Upcoming → see next ~14 days → open a row → structure steps when `structuredWorkout` present → “Open in Coach Watts”.
5. Empty states: athlete with no history / no upcoming shows honest empty copy (no crash).
