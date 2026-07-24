## Context

Athlete (`/(app)/athlete`) is the profile workbench: identity, HR thresholds, AI report, goals lite, editable metrics. Today already has a 7-day `WeekGlanceStrip` from thin recent + planned queries. Product docs historically forbid calendar heatmaps on Today; this change adds a longer done/planned day-circle glance **only on Athlete**.

Existing list APIs are sufficient but Today’s defaults are too thin: `RECENT_ACTIVITY_LIMIT = 10`, planned window ~14 days / limit 20. A 12-week strip (~70 days past + ~14 days future) needs glance-scoped fetches.

## Goals / Non-Goals

**Goals:**

- Rolling 12×7 day-circle glance on Athlete (10 weeks back through current week + 2 weeks forward).
- Binary cell states: done / planned / empty (+ today ring).
- Count header (`N done · M planned`); taps into existing activity/planned routes.
- Honest loading / empty / error; semantic tokens; Hallmark stamp.
- Docs clarify Athlete glance vs Today heatmap non-goal.

**Non-Goals:**

- Year contribution graph, streaks, TSS intensity, compliance legend.
- Today heatmap or CTL grid.
- New coach-wattz aggregate / BFF.
- Changing Today week-strip query keys or default limits.

## Decisions

### 1. Placement: Athlete under identity, before AI report

**Choice:** Mount `ActivityGlanceStrip` in the Athlete scroll composition after the overview identity/HR lead (or as a sibling section immediately under `AthleteProfileOverview` header content) and before the denser AI report block.

**Why:** Rhythm glance belongs with “who I am / how I’m training,” not buried under Sync / report. Keeps Today’s first viewport clean.

**Alternatives:** On Today (rejected — heatmap non-goal); only More (rejected — name tap already goes to Athlete).

### 2. Window: 10 weeks past + current week + 2 weeks forward

**Choice:** Monday-start weeks; 12 columns total.

**Why:** Mostly retrospective (activity density) with a short forward look for planned — matches “how active / how future looks” without a year grid.

### 3. Pure compute + reuse `localDateKey`

**Choice:** New `computeActivityGlance` (sibling module under `src/features/profile/` or `activity/`) importing `localDateKey` / week helpers from `weekGlance.ts`. Vitest covers date-only vs ISO midnight (issue 028 rules).

**Why:** Same calendar-stable bucketing as Today; no duplicated timezone bugs.

### 4. Glance-scoped queries, not Today keys

**Choice:** Dedicated TanStack Query keys (e.g. `['activity', 'glance', 'workouts']`, `['activity', 'glance', 'planned']`) with:

- Workouts: raise client cap and/or paginate `GET /api/workouts?limit&offset` until the glance past window is covered or a safety page ceiling is hit.
- Planned: `startDate`/`endDate` covering glance future (+ optional short lookback unused for cells) with limit high enough for dense plans (e.g. 60–100).

**Why:** Avoid starving Today’s recent list or invalidating unrelated UI; avoid silently under-filling the strip with only 10 workouts.

**Alternatives:** Reuse monthly-comparison for past (rejected — no planned; sport-filtered); PMC TSS (rejected — no planned, wrong metaphor).

### 5. Cell semantics and taps

**Choice:** Past/today: `hasDone` wins visually if both done and planned that day. Future: `hasPlanned` outline only. Tap: one activity → activity detail; one planned (and no done) → planned detail; else Recent if past-ish day, Upcoming if future.

**Why:** Simple v1; lists remain the multi-session escape.

### 6. Visual language

**Choice:** Small circles with `brand` fill for done, `border-strong` outline for planned, `border` for empty, subtle ring for today. No orange contribution-graph chrome. Stamp `docs/DESIGN.md`.

## Risks / Trade-offs

- **[Sparse past history if API page ceiling hit]** → Cap pages reasonably; still show partial strip; empty past is honest.
- **[Dense planners exceed planned limit]** → Raise glance limit; document residual gap until aggregate exists.
- **[Doc conflict with “no heatmaps”]** → Explicit Athlete exception in product-baseline / DESIGN / open-questions.
- **[Athlete scroll density]** → Keep glance compact (one header line + grid); skeleton while loading; no streak stats row.

## Migration Plan

1. Ship behind normal release train (no feature flag required).
2. Rollback = remove strip + glance hooks; Today unchanged.
3. No auth scope changes if workouts/planned already companion-scoped.

## Open Questions

_None for v1 — locked in proposal._
