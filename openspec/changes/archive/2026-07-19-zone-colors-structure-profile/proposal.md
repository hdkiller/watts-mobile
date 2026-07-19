# Zone Colors and Structure Profile

## Why

Zones and workout structure are the two most information-dense surfaces in the app, yet both render monochrome text (docs/issues/009.md, docs/issues/008.md). A conventional Z1–Z5 color ramp and a compact intensity-profile silhouette give athletes the session's shape at a glance — the single highest-value visual addition identified in the UX review.

## What Changes

- New shared zone color ramp (Z1→Z5: blue → green → yellow → orange → red, extendable to Z6/Z7) added to theme tokens and documented in `docs/DESIGN.md`.
- Zone-time bars in activity charts and the planned-detail zone list are colored by the ramp.
- Planned detail renders a `StructureProfile` silhouette above the step list when interval/step data exists: horizontal blocks, width proportional to duration, height/color by intensity. Steps without usable duration/intensity fall back to the current text-only list — no invented data.

No coach-wattz backend dependency; all data already present in `structureSteps`, `zoneSummary`, and stream zone histograms.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `activity-charts`: zone distribution bars SHALL be colored by the shared zone ramp.
- `upcoming-planned`: planned structure summary SHALL include a graphical intensity profile when step duration/intensity data allows; the compact zone summary SHALL color-key zone rows with the same ramp.

## Impact

- `src/theme/colors.ts` + `tailwind.config.js` — zone palette tokens; `docs/DESIGN.md` update.
- New `src/features/activity/charts/StructureProfile.tsx` (SVG via existing `react-native-svg`).
- `src/features/activity/charts/BarSeriesChart.tsx` — per-bar color support for zone bars.
- `app/(app)/planned/[id].tsx` — profile above steps; colored zone rows.
- `src/features/activity/mapActivity.ts` — expose numeric intensity/zone index per step where derivable (tests).
