# Tasks — Zone Colors and Structure Profile

## 1. Zone palette

- [x] 1.1 Add `Colors.zones` ramp + `zoneColor(index)` (clamping) to `src/theme/colors.ts`; mirror in `tailwind.config.js` if class access is needed; document in `docs/DESIGN.md`
- [x] 1.2 Extend `BarSeriesChart` items with optional per-bar `color`; pass ramp colors from `zoneBarsToItems` (power-curve rendering unchanged)
- [x] 1.3 Color-key the planned-detail zone summary rows (small swatch/left border per row)

## 2. Structure profile

- [x] 2.1 Add `stepIntensity(step)` parser to `mapActivity.ts` (`Z<n>`, `%FTP`, named zones; confident matches only) with unit tests over observed `intensityLabel` samples
- [x] 2.2 Build `src/features/activity/charts/StructureProfile.tsx` (SVG row: width ∝ duration with 2pt minimum, height/color from intensity, neutral fallback blocks, null when <2 timed steps)
- [x] 2.3 Render the profile above the step list in `app/(app)/planned/[id].tsx`

## 3. Verification

- [x] 3.1 `npx tsc --noEmit` and `npm test` pass (parser + mapping tests included)
- [ ] 3.2 Manual pass: interval workout shows a legible silhouette; steady/unstructured workouts show no profile; zone bars and zone list use the same colors
