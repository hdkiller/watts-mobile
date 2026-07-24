## Context

coach-wattz calendar/activity rows render `MiniWorkoutChart.vue`: flatten steps (including repeats), size bars by duration, height/color from `resolveStepChartIntensity` + athlete zone ranges (`zone-colors.ts`). Mobile already ships `StructureProfile` on planned detail, but colors via `stepIntensity(intensityLabel)` after `intensityFromStep` stringifies targets — absolute watts/`%FTP`-as-watts become gray. Upcoming/Today list rows never show a structure chart; list mappers omit `structuredWorkout`.

Constraints: companion lite (no plan architect / full WorkoutChart); keep business logic thin on device; prefer existing Bearer payloads; companion zone ramp stays brand-distinct (`Colors.zones`).

## Goals / Non-Goals

**Goals:**

- Target-aware intensity for endurance silhouette height + zone color on planned detail.
- Correct intensity labels for `%FTP` / percent / zone units (display + coloring).
- Better shape parity: expand repeats into timed bars; ramp wedges when ramp targets exist; rest/fallback heights when intensity is known.
- Optional compact list glance when structure preview is already on the list/Today payload (no N+1 detail fetches).

**Non-Goals:**

- Full interactive WorkoutChart / editor, cadence overlays, strength block mini-columns.
- Calendar heatmap or CTL grids.
- Forcing mobile zone palette to match web emerald Z1.
- Inventing list API fields without confirming coach-wattz contracts.

## Decisions

### 1. Resolve intensity from raw step targets, not labels

**Choice:** Add a mobile intensity resolver (port/adapt semantics of coach-wattz `shared/workout-render-model.ts` `resolveStepChartIntensity`) that consumes step `power` / `heartRate` / `pace`, `zoneProfileSnapshot`, and optional athlete refs (FTP / LTHR / threshold pace from profile or sport settings). Map relative intensity → zone index via snapshot ranges when present, else Coggan-style default bands (same idea as web defaults). Use that for `StructureProfile` height/color; keep `intensityLabel` for the text step list.

**Why not keep label parsing only?** Real sessions store watts / `%FTP` on `power`; labels like `"150 W"` intentionally fail `stepIntensity` today.

**Alternatives considered:** Copy Vue component logic into RN — rejected (heavy, cadence/strength paths unused). Call a new API for precomputed chart bars — rejected (extra round-trip; data already on detail).

### 2. Prefer snapshot + step units before profile FTP

**Order:** (1) zone-unit targets via snapshot bands, (2) percent / `%FTP` / relative pace on the step, (3) absolute watts/bpm/mps ÷ profile or sport thresholds when available, (4) existing label parse, (5) neutral gray. Never invent FTP.

### 3. Flatten for the chart separately from the text list

**Choice:** Chart path expands `reps`/`repeat` (capped) into timed leaf steps like web `flattenWorkoutSteps`. Text step list may keep the compact `×N` cue + one child pass (current UX) unless a small follow-up wants list expansion too.

**Why:** Silhouette fidelity matters most for glance; duplicating 5×3 bars in the text list is noisier.

### 4. Ramps as SVG polygons; steady as rects

**Choice:** When a step has ramp targets (or `ramp: true`), render a clip/polygon bar from start→end intensity; otherwise keep duration-width rects. Cap height scale at ~120% relative intensity (web parity).

### 5. List glance is phase-gated on payload

**Choice:** Ship detail coloring (P0) + shape (P1) first. List/Coming-up mini charts (P2) only after confirming `GET /api/planned-workouts` (or Today aggregate) includes previewable structure without per-row detail fetch. If absent, open a coach-wattz follow-up for a compact preview field — do not N+1.

### 6. Keep companion zone colors

**Choice:** Continue `Colors.zones` / `zoneColor`. Document intentional divergence from web `ZONE_COLORS`.

## Risks / Trade-offs

- **[Risk] Missing FTP → watts still gray** → Mitigation: percent/zone units still color; document honest neutral; optionally surface Open web for depth.
- **[Risk] Divergent flatten caps vs web** → Mitigation: document caps (depth/reps/step count); Vitest fixtures from real `structuredWorkout` samples.
- **[Risk] List API too heavy if full structure attached** → Mitigation: prefer tiny preview or omit list charts; never fan out detail fetches.
- **[Risk] Port drift from web resolver** → Mitigation: mirror test vectors from `workout-render-model.test.ts` where practical; comment source file reference.

## Migration Plan

1. Land mapper + `StructureProfile` changes behind existing planned detail only (no route changes).
2. Vitest for watts / `%FTP` / zone / ramp / repeat fixtures.
3. Manual check against a known sweet-spot planned workout vs web calendar cell.
4. If list payload supports it, add compact row chart; else track backend follow-up in `docs/open-questions.md`.

Rollback: revert mapper/chart commits; text step list remains usable without the silhouette.

## Open Questions

1. Does `GET /api/planned-workouts` (or Today companion aggregate) already return `structuredWorkout` for any clients, or is structure detail-only today?
2. Should chart metric preference follow sport `targetPolicy` / `loadPreference` (web) or always prefer power→HR→pace from available step targets?
3. Should absolute-watt coloring wait on default-profile FTP only, or also merge per-sport FTP from Settings → Sports when workout `type` matches?
