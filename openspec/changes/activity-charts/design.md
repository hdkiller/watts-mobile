## Context

Detail GET with streams is too large for mobile. Dedicated `/streams` downsamples to ≤2000 points and attaches zone definitions + histograms. `/power-curve` returns a tiny peak-power series. Activity detail already loads summary/AI with `includeStreams=false`.

## Goals / Non-Goals

**Goals:**

- Show power and/or HR vs time when series exist.
- Show power or HR zone time bars when histograms exist.
- Show power curve when `hasPowerData`.
- Lazy-load chart queries only on the activity detail screen.
- Omit empty chart sections; honest empty/error for missing streams.

**Non-Goals:**

- Map / GPS path.
- Full multi-channel timeline (cadence, altitude, etc.) in v1 of this change.
- Pinch-zoom / brush selection (basic static charts first).
- Changing server downsample API.

## Decisions

1. **Separate chart queries** (not bloating detail)
   - `useActivityStreamsQuery(id)` → `/api/workouts/:id/streams`
   - `useActivityPowerCurveQuery(id)` → `/api/workouts/:id/power-curve`
   - Parallel with existing summary query; charts section shows loading independently.

2. **Client display downsample to ≤200 points** for line charts (even if API returns 2k) for SVG performance.

3. **Custom SVG charts** via `react-native-svg` (LineChart + BarChart primitives) rather than a heavy chart framework — matches brand colors, small surface area.

4. **Channel priority for line chart**
   - Dual series when both power and HR exist (two polylines, legend).
   - Single series otherwise.
   - X axis = elapsed time from `time[]` (or index×1s fallback).

5. **Zones**
   - Prefer power zones when `powerZoneTimes` has values; else HR.
   - Convert sample counts to minutes for labels; bar width ∝ count.

6. **Rebuild note**
   - Document `react-native-svg` in native-modules examples; Open web CTA copy becomes “Open for map & more”.

## Risks / Trade-offs

- **[Risk] Large `/streams` still includes unused arrays (latlng, etc.)** → Mitigation: accept for now; optional future server `fields=` trim.
- **[Risk] SVG chart jank on low-end devices** → Mitigation: hard cap 200 display points.
- **[Risk] Missing native module until rebuild** → Mitigation: call out in tasks/docs; charts guarded so summary/AI still work if import fails… actually can't easily guard native import — rebuild required.
- **[Risk] splits_fallback has no watts/HR series** → Mitigation: show zones/pacing if any; otherwise omit charts with honest copy.

## Migration Plan

- Client + dependency. Rebuild dev client.
- Rollback: remove chart section + dependency.

## Open Questions

- None blocking. Cadence/altitude toggle can follow later.
