# Hallmark audit · Measurement sheets

- **Wave:** D
- **Pri:** P3
- **Route/file:** `src/features/measurements/MeasurementSheet.tsx` + `MeasurementsDetailSheet.tsx` (+ body `MeasurementsSection.tsx`)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Add sheet is a focused write flow (category → metric chips → value → Save via shared `Button`). Detail sheet is a thin shell over `MeasurementsSection`, which duplicates picker/form and adds latest list + web handoff. Semantic surfaces mostly correct; chip active wash improvises brand rgba and loading uses a spinner.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `MeasurementSheet.tsx` / `MeasurementsDetailSheet.tsx` (file tops; no stamp)
  - **Severity** — major
  - **Fix** — Stamp both sheets (+ section if treated as its own surface).

- **Tell** — `design-system drift` (raw brand rgba wash on active chips)
  - **Where** — `MeasurementSheet.tsx` ~179–180, ~234–235; `MeasurementsSection.tsx` ~125–126, ~411–412 (`rgba(0, 220, 130, 0.1)`)
  - **Severity** — major
  - **Fix** — Tokenize (e.g. `bg-brand/10` via theme) — never inline brand hex/rgba in components.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `MeasurementsSection.tsx` ~333–335 (`ActivityIndicator` when `isLoading && !data`)
  - **Severity** — major
  - **Fix** — List/card skeleton matching latest-metrics + form layout (section load, not button wait).

- **Tell** — Pill-chip metric grid density (category + wrap chips)
  - **Where** — `MeasurementSheet.tsx` ~139–206; `MeasurementsSection.tsx` `MetricPicker` ~76–147
  - **Severity** — major
  - **Fix** — Prefer segmented control / single-column metric list over dual pill clusters; keep text-first selection.

## Minor

- **Tell** — Prefer `AnimatedPressable` for Cancel/Close and chips
  - **Where** — sheet headers ~132–134 / ~35–37; chip pressables throughout
  - **Severity** — minor
  - **Fix** — Animated press; Save already uses shared `Button`.

- **Tell** — Title scale (`text-xl font-bold` vs DESIGN `text-2xl`/`text-lg font-semibold`)
  - **Where** — both sheet headers
  - **Severity** — minor
  - **Fix** — Align sheet titles to type scale.

## Count

0 critical · 4 major · 2 minor

## What works

Shared `Button` for Save; error uses tint-error card + brand Retry in section; empty copy honest; web History handoff is text link with brand color + hitSlop; haptics on chip/save align with DESIGN map.
