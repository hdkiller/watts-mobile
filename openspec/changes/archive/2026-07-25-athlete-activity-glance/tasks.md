## 1. Domain + data

- [x] 1.1 Add `computeActivityGlance` (12 weeks, Mon-start, done/planned/empty + today) reusing `localDateKey` / week helpers from `weekGlance.ts`
- [x] 1.2 Add Vitest coverage for date-only / UTC-midnight bucketing and window bounds
- [x] 1.3 Add glance-scoped fetch helpers + TanStack Query hooks (workouts with raised/paginated limit; planned with widened window/limit; separate query keys from Today)

## 2. UI + Athlete wiring

- [x] 2.1 Build `ActivityGlanceStrip` (header counts, day circles, skeleton / empty / inline error+retry, `testID`s, DESIGN stamp)
- [x] 2.2 Wire glance into Athlete screen with day-tap navigation (single activity/planned detail vs Recent/Upcoming)
- [x] 2.3 Keep Today week strip and default recent/upcoming query semantics unchanged

## 3. Docs + polish

- [x] 3.1 Update `docs/product-baseline.md`, `docs/DESIGN.md`, and `docs/open-questions.md` for Athlete glance exception vs Today heatmap non-goal
- [x] 3.2 Hallmark audit Athlete + glance; record findings; patch Critical/Major (and clear Minors)
