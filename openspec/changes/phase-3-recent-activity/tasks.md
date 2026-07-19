## 1. Activity data layer

- [ ] 1.1 Confirm workout list DTO fields for sync/analysis status in coach-wattz
- [ ] 1.2 Confirm planned list query params + planned detail Bearer/`workout:read` (fix in coach-wattz if session-only)
- [ ] 1.3 Confirm planned structure/interval fields for mobile summary (document if secondary endpoint needed)
- [ ] 1.4 Add `src/features/activity` types, recent list fetch (`limit` capped), upcoming planned fetch (date window + limit), detail helpers
- [ ] 1.5 Wire TanStack Query for recent list, upcoming list, activity detail, planned detail

## 2. Activity / upcoming UI

- [ ] 2.1 More → Recent activity list with empty/loading/error
- [ ] 2.2 More → Upcoming planned list with empty/loading/error
- [ ] 2.3 Row status mapping for recent (honest unknowns)
- [ ] 2.4 Lite activity summary stack + Open web escape hatch
- [ ] 2.5 Deepen planned detail: structure/interval summary when available + Open web escape

## 3. Verify

- [ ] 3.1 Typecheck + unit tests for status / planned structure mappers
- [ ] 3.2 Manual smoke against local workouts + planned-workouts
- [ ] 3.3 Update implementation-plan / product baseline notes if entry point differs
