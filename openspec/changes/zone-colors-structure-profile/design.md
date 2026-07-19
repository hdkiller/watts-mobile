# Design — Zone Colors and Structure Profile

## Context

`BarSeriesChart` renders zone bars with a single accent color; the planned-detail zone summary is a text table; `structureSteps` (name, `durationSec`, `intensityLabel`) render as a divided text list. `react-native-svg` is already a dependency (charts use it). Step intensity arrives as labels (e.g. "Z2", "85% FTP", "Tempo") whose parseability varies.

## Goals / Non-Goals

**Goals:**
- One zone palette shared by charts, zone lists, and the structure profile.
- A silhouette that communicates session shape without pretending to more precision than the payload has.

**Non-Goals:**
- No interactive scrubbing/tooltips on the profile (later, with chart interactivity).
- No zone charts on planned detail (existing spec constraint) — the profile is a structure visualization, not a time-in-zone chart.
- No backend changes; no invented intervals when structure is absent.

## Decisions

1. **Palette as ordered token array.** `Colors.zones: string[]` (Z1→Z7) in `colors.ts`; consumers index with `zoneColor(i)` clamping to the last entry. Conventional ramp: Z1 `#3b82f6` blue, Z2 `#22c55e` green, Z3 `#eab308` yellow, Z4 `#f97316` orange, Z5 `#ef4444` red, Z6 `#a855f7`, Z7 `#71717a`-deep variant — final hexes tuned for the dark background during implementation and recorded in DESIGN.md.
2. **Intensity extraction is best-effort and explicit.** A pure `stepIntensity(step)` helper in `mapActivity.ts` returns `{ zoneIndex?: number; fraction?: number }` parsed from `intensityLabel` (`Z<n>`, `<n>% FTP`, named zones via a small lookup). Unparseable steps get a neutral mid-height gray block — shape stays honest, color only where known. Unit-tested against real label samples.
3. **Profile rendering.** `StructureProfile` draws one SVG row (fixed height ~56pt, full width): block width ∝ `durationSec` (min 2pt so short efforts stay visible), height ∝ fraction (or zone index / max zones), fill from the ramp, 1pt gaps. Rendered only when ≥2 steps have positive durations; otherwise the component returns null and the text list stands alone.
4. **Per-bar colors in BarSeriesChart.** Extend items with optional `color`; zone bars pass ramp colors, power-curve usage keeps its single accent — no visual change outside zones.

## Risks / Trade-offs

- [Label parsing misreads intensity] → conservative parser (only confident matches color), gray fallback, tests over observed labels; wrong-color risk beats a blank feature.
- [Very long workouts squash short intervals] → 2pt minimum block width with proportionality otherwise; acceptable distortion for a glance graphic.
- [Ramp clashes with brand green (Z2 ≈ brand)] → tune Z2 toward emerald/teal distinct from `#00DC82`; validate on device.

## Open Questions

- Whether planned payloads ever carry explicit numeric targets (watts/%FTP) alongside labels — if so, prefer them over label parsing (check coach-wattz `structuredWorkout` shape during implementation).
