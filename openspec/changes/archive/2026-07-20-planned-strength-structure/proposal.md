## Why

Strength planned workouts store their structure as `blocks` / `exercises` with per-set `setRows`, but the mobile planned detail mapper only reads endurance-style top-level `steps` / `intervals`. Athletes open a gym session in the companion and see duration/TSS/zones with no exercises — they have to bounce to web for the actual plan.

## What Changes

- Extend planned-structure mapping so strength payloads (`structuredWorkout.blocks`, legacy `exercises`) produce a compact in-app exercise list (name + sets/reps/load/rest when present).
- Keep the existing endurance `steps` / `intervals` path unchanged.
- Skip the duration×intensity `StructureProfile` silhouette for strength-shaped structure (no meaningful interval profile).
- Preserve Open web for full strength editor / library depth; no plan-architect UI in the companion.

No coach-wattz API or schema changes — data is already on `GET /api/planned-workouts/:id` via `structuredWorkout`.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `upcoming-planned`: richer planned structure summary SHALL also cover strength `blocks` / `exercises` (sets/reps/load), not only interval `steps`.

## Impact

- `src/features/activity/mapActivity.ts` — strength-aware structure flatten + tests.
- `src/features/activity/types.ts` — structure step fields for strength prescription metadata (or reuse `intensityLabel` for compact prescription text).
- `app/(app)/planned/[id].tsx` — render strength rows; hide intensity profile when structure is strength-shaped.
- Existing `StructureProfile` / zone summary behavior unchanged for Ride/Run/etc.
