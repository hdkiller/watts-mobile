## Context

`GET /api/nutrition/plan?start&end` returns days composed of fueling **windows** (pre-workout, intra, post, and standing meals), each carrying a type, a scheduled time, and macro targets, with zero or one locked meal attached. `mapNutritionPlanDays` flattens this to `{ dateKey, weekdayLabel, meals[] }` and drops the window layer, which is why the day sheet can only list meals and cannot show what a window is asking for or offer an empty slot to fill.

Two write paths exist and mean different things. `PATCH /api/nutrition/plan/meals/{mealId}` acts on an **existing** plan meal (`complete | skip | unlock | replace`). `POST /api/nutrition/plan/meal` locks a meal into a `(date, windowType)` slot — it is how a chosen recommendation becomes the plan, and it works whether or not the window already holds something. Mobile has the second wired in `api.ts` but never calls it.

## Goals / Non-Goals

**Goals:**

- See each fueling window with its targets before deciding.
- Swap a planned meal for an alternative.
- Fill an empty window with a chosen meal.
- Honest handling of slow or quota-limited AI recommendation calls.

**Non-Goals:**

- Free-form meal composition on mobile (no ingredient editor) — pick from recommendations or leave it.
- The Strategy tab (fuel state, hydration debt, energy horizon) — separate change.
- Grocery list changes beyond reflecting newly locked meals.
- Changing Done / Skip / Unlock semantics.

## Decisions

### 1. Window is the unit of the day sheet, meal is its content

Restructure `mapNutritionPlanDays` to return windows with an optional meal rather than a bare meal list. This makes the empty slot representable — today an unfilled window is simply invisible, which is why "lock a meal" has nowhere to be triggered from. The day-row summary on the week list keeps its current shape.

### 2. `replace` via patch, new meals via lock

Use `PATCH .../meals/{mealId}` with `action: 'replace'` when the window already has a meal and the athlete picked a different one; use `POST /api/nutrition/plan/meal` when the window is empty. Both refresh the same query. Picking the endpoint by window state keeps the client honest about which server semantics it is invoking.

### 3. Recommendations are fetched on demand, never prefetched

The endpoint is AI-backed and quota-limited. Fetch only when the athlete opens the picker for a specific window, show a real pending state, and never fire it speculatively while rendering the week.

### 4. Quota and failure are surfaced, not swallowed

Web's `handleQuotaError` distinguishes quota exhaustion from a generic error. Mobile mirrors that distinction in copy — a quota message must not read as "something went wrong", or athletes will retry into a wall.

### 5. Picker is a sheet, consistent with the rest of Plan

Reuse the `BottomSheet` pattern already used for tune-week, generate-week, and move-workout. Options render as selectable cards with title and macro totals; confirming locks.

## Risks / Trade-offs

- [Risk] Recommendation latency makes the picker feel broken → Mitigation: skeleton options + elapsed-time hint, matching the `busyElapsedSec` pattern in `PlanTrainingSegment`.
- [Risk] Quota exhaustion mid-week leaves windows unfillable → Mitigation: honest quota copy; Skip and Unlock still work without AI.
- [Risk] Window restructure breaks the existing week-summary counts → Mitigation: keep `weekHasSelectedMeals` semantics; derive counts from windows' meals; cover with mapper tests.
- [Risk] Locking into a window the server considers occupied → Mitigation: choose patch-vs-lock from the mapped window state, and re-read after write rather than assuming.

## Migration Plan

`mapNutritionPlanDays` changes shape, so its two current consumers (`PlanNutritionSegment`, and the empty-week hint in `PlanTrainingSegment`) update together. No persisted data or server change.

## Open Questions

- Whether the recommendation payload includes ingredients rich enough for the grocery list to pick up a locked meal without a regenerate.
- Whether `slotName` / `windowAssignments` (accepted by `plan/meal.post`) are needed for correct placement on mobile, or whether `(date, windowType)` alone is sufficient.
