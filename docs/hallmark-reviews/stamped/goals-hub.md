# Hallmark audit · Goals hub (regression)

- **Wave:** stamped / regression
- **Surfaces:** `app/(app)/goals/index.tsx`, `[id].tsx`, `new.tsx`, `src/features/goals/GoalsLiteSection.tsx`
- **Date:** 2026-07-24
- **Genre:** modern-minimal (stamp)
- **Macrostructure:** Workbench · `designed-as-app`
- **Design system:** docs/DESIGN.md
- **Stamp:** present on all four files

## Summary

Stamps hold. App-Workbench list → detail → lite-create reads as a field hub, not a marketing screenshot tour. List fingerprint (brand type-code tile) is intentional and distinct from Events’ date tile. GoalsLiteSection stays a teaser, not a second hub. No stamp lies; no raw zinc/white drift.

## Critical

_None._

## Major

_None._

## Minor

- **Tell** — `design-system drift` (error chrome)
  - **Where** — `app/(app)/goals/index.tsx` ~L64–68; `app/(app)/goals/[id].tsx` ~L66–70
  - **Severity** — minor
  - **Fix** — Match DESIGN States / GoalsLiteSection: `border-danger/40 bg-tint-error` card + brand Retry (not bare `text-red-400`).

- **Tell** — `design-system drift` (press primitive)
  - **Where** — `app/(app)/goals/new.tsx` ~L97–109, L138–149 (`Pressable` type + priority chips)
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable` + `hitSlop={8}` per DESIGN Standardized Press Animations.

## Stamp / family notes

| Claim | Verdict |
|-------|---------|
| Workbench | Holds (utilitarian hub: header Add · bordered rows · web handoff) |
| modern-minimal | Holds |
| design-system: DESIGN.md | Holds (semantic tokens; shared `Button` / skeletons) |
| Type-code vs Events date-tile | Intentional fingerprint — not variety drift |

## Count

0 critical · 0 major · 2 minor

## What works

Semantic surfaces/cards; `ListSkeleton` / `DetailSkeleton`; honest empty; type-code row fingerprint; detail hairline fields + `HeroStatTiles`; lite create keeps edit/delete on web; GoalsLiteSection one primary hit + All goals; haptics map respected.
