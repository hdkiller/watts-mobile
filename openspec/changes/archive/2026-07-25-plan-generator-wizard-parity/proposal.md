## Why

The shared training plan generator already sends most initialize fields, but athletes still cannot choose which goal the season is built for, set start/end dates, or see phase structure before activate — gaps versus the web PlanWizard that change season shape and trust.

## What Changes

- Add an in-flow **goal step** to the shared generator: list existing goals, select one, or jump to create; default to primary when present (unlike web’s forced tap, mobile may auto-select a single/primary goal for speed).
- Collect **start date** and **end date / duration** and send them on `POST /api/plans/initialize` (stop relying only on server goal-date fallback).
- Pass matching **`startDate` on activate**; keep anchor-workout multi-select out of this change (documented follow-up).
- Show a compact **phase/block glance** from initialize result before activate (not a full web Phase editor).
- Surface strategy/recovery as discoverable options (already collected); fix masters recovery default when age is known.
- Activation plan host falls back to primary-goal query when activation state lacks `primaryGoalId`.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `plan-lite`: Generator must bind a selected goal, send calendar fields on initialize, pass activate `startDate`, and show a phase glance + first-week preview before confirm.
- `goal-lite`: Existing goals from goal lite MUST be selectable during plan generation; create remains the existing goals/new surface (no nested EventGoalWizard).

## Impact

- `PlanGeneratorPanel` / `planGeneratorHelpers` / `activatePlan` callers
- Plan create + activation plan hosts
- `useGoalsQuery` / `pickPrimaryGoal` (read path only; create via existing `/(app)/goals/new`)
- coach-wattz APIs unchanged: `GET /api/goals`, `POST /api/plans/initialize`, `POST /api/plans/:id/activate`
- Out of scope: templates, Intervals publish, anchor workout picker, full EventGoalWizard, rich availability slots
