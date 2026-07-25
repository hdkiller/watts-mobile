## Why

Athlete (Today name / More → Athlete) today shows identity, HR thresholds, and the AI profile report — but no training-rhythm glance. Athletes still open Recent / Upcoming lists (or web) to see how active they were and what is planned next. A compact past+future day glance on Athlete closes that gap without adding a calendar heatmap to Today.

## What Changes

- Add an **Activity glance** on Athlete: rolling **12 week columns × 7 day circles** (Mon-start), covering **10 weeks back through the current week + 2 weeks forward**.
- Cell meaning: filled = completed workout that day; soft outline = planned session ahead; dim empty = rest / no data; today = subtle ring.
- Header line with short counts (`N done · M planned`) — **no streaks**, no TSS intensity, no compliance legend.
- Tap a day: open activity or planned detail when exactly one match; otherwise Recent or Upcoming lists.
- Dedicated glance-scoped fetches from existing Bearer APIs (`GET /api/workouts`, `GET /api/planned-workouts`) with windows/limits wide enough for the strip — **without** changing Today’s recent/upcoming default query semantics.
- Clarify product docs: Athlete 12-week glance is in scope; Today CTL grids / calendar heatmaps remain non-goals.

## Capabilities

### New Capabilities

- `athlete-activity-glance`: Rolling 12-week done/planned day-circle strip on Athlete, glance-scoped data, taps into existing activity/planned surfaces.

### Modified Capabilities

- `athlete-profile-overview`: Athlete destination SHALL present the activity glance in addition to identity + AI overview (not Today, not a year heatmap).

## Impact

- **watts-mobile:** new glance UI + pure compute helpers (reuse `localDateKey` / week math); Athlete route wiring; Vitest for date bucketing; docs updates (`product-baseline`, `DESIGN`, `open-questions`).
- **coach-wattz:** none if workouts + planned-workouts remain Bearer with existing companion scopes; may need higher `limit` / date-range than Today’s thin lists (client pagination or raised caps — no new aggregate required for v1).
- **Out of scope:** year contribution graph, streaks, TSS brightness, compliance states, Today heatmap, new `/api/mobile/*` BFF.
