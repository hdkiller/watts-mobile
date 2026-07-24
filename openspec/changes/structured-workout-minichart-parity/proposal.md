## Why

Planned structured-workout mini charts on mobile often render as flat gray bars even when coach-wattz calendar/activity minicharts are vividly zone-colored for the same workout. Mobile colors from a best-effort parse of display labels (`"150 W"` → neutral), while web resolves raw step targets through FTP/LTHR/zone snapshots. Athletes lose the session shape at a glance — the highest-value visual on planned detail (and on web list/calendar rows).

## What Changes

- Replace label-only intensity coloring for the endurance structure silhouette with target-aware intensity resolution aligned to coach-wattz (`resolveStepChartIntensity` semantics): watts / `%FTP` / power zones / HR / pace → relative intensity → shared zone ramp.
- Fix `intensityFromStep` unit handling so `%FTP` / percent targets are not mislabeled as watts (and remain colorable when shown as text).
- Improve silhouette fidelity for common structure shapes: expand repeat blocks into timed bars, render ramp steps as start→end height wedges when target data allows, and apply honest rest/fallback heights instead of always-neutral mid bars when intensity is known.
- Optionally add a compact mini-chart glance on Upcoming (and Today Coming up) rows when structure preview data is available without N+1 detail fetches — **gated on list payload carrying previewable `structuredWorkout` (or a dedicated preview field)**; no full calendar heatmap.
- Strength-shaped structure stays text prescription only (no endurance silhouette) — unchanged.

## Capabilities

### New Capabilities

- `structured-workout-minichart`: Target-aware intensity resolution and endurance structure mini-chart rendering (detail silhouette; optional list glance) using `structuredWorkout` step targets, zone profile snapshot, and athlete thresholds when available.

### Modified Capabilities

- `upcoming-planned`: Intensity-profile requirement upgrades from “parseable intensity labels” to target-aware coloring/height; optional compact chart on Upcoming/Coming-up rows when preview data is present on the list payload.

## Impact

- Mobile: `src/features/activity/mapActivity.ts` (intensity mapping), `StructureProfile.tsx` (and possibly a shared mini-chart helper), `app/(app)/planned/[id].tsx`, optionally Upcoming / Coming-up row UI; Vitest for intensity resolution + fixtures mirroring web cases.
- Theme: keep companion `Colors.zones` ramp (brand-distinct from web emerald Z1); do not force coach-wattz palette.
- coach-wattz: **no schema invention** — reuse existing `structuredWorkout` + `zoneProfileSnapshot` on detail. List/glance may need confirming whether `GET /api/planned-workouts` (or Today aggregate) already returns structure or needs a small preview field; document as backend dependency before shipping list charts.
- Non-goals: full `WorkoutChart` editor, cadence overlays, strength block columns, calendar heatmap, plan architect.
