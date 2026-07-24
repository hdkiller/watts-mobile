## Why

The Athlete activity glance is a fixed 12-week window, so older training rhythm and nutrition logging gaps stay hidden behind list screens. Athletes want to swipe through time and flip to a nutrition twin to spot days they did not log — without a full calendar or analytics explorer.

## What Changes

- Add **horizontal paging** on the Athlete activity glance: each page is a 12-week Mon-start block; swipe toward older history; the live page (current window + short planned future) is the forward bound.
- Add an **Activity | Nutrition** segment on the same glance when nutrition tracking is enabled.
- Nutrition mode uses the same day-circle grid: filled = day with logged intake; empty = gap; today ring. Header counts logged vs gaps (no calorie heat, no streaks).
- Hide the Nutrition segment when tracking is off (same gate as Today nutrition glance).
- Nutrition taps navigate to Log (companion write surface); activity taps keep existing detail/list behavior.
- Extend glance-scoped fetches for shifted windows and `GET /api/nutrition?startDate&endDate` for nutrition pages.

## Capabilities

### New Capabilities

- `athlete-glance-swipe-nutrition`: Time-paged Athlete glance + Nutrition day-logged mode gated on tracking.

### Modified Capabilities

- `athlete-activity-glance`: Glance SHALL support horizontal page swipes across 12-week blocks and an optional Nutrition mode segment when tracking is enabled.

## Impact

- **watts-mobile:** extend `activityGlance` range math for `pageOffset`; nutrition glance compute + fetch; rewrite `ActivityGlanceStrip` with pager + segment; Vitest; light docs/open-questions note.
- **coach-wattz:** none if workouts, planned-workouts, and nutrition list remain Bearer with existing scopes (`workout:read`, `nutrition:read`).
- **Out of scope:** year heatmap, TSS/calorie intensity, compliance legend, Today placement, nutrition planning charts.
