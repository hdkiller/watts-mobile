# Hallmark audit · Events hub (regression)

- **Wave:** stamped / regression
- **Surfaces:** `app/(app)/events/index.tsx`, `[id].tsx`, `new.tsx`
- **Date:** 2026-07-24
- **Genre:** modern-minimal (stamp)
- **Macrostructure:** Workbench · `designed-as-app`
- **Design system:** docs/DESIGN.md
- **Stamp:** present on all three files

## Summary

Stamps hold. Same Workbench family as Goals (expected), but date-tile rows + countdown accent + create field-order keep a distinct fingerprint — not an indistinguishable shell. No stamp lies; no raw zinc/white drift.

## Critical

_None._

## Major

_None._

## Minor

- **Tell** — `design-system drift` (error chrome)
  - **Where** — `app/(app)/events/index.tsx` ~L64–70; `app/(app)/events/[id].tsx` ~L66–70
  - **Severity** — minor
  - **Fix** — Use tinted error card (`border-danger/40 bg-tint-error`) + brand Retry per DESIGN States.

- **Tell** — `design-system drift` (press primitive)
  - **Where** — `app/(app)/events/new.tsx` ~L94–127 (type + priority `Pressable` chips)
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable` + `hitSlop={8}`.

## Stamp / family notes

| Claim | Verdict |
|-------|---------|
| Workbench | Holds |
| Date-tile list fingerprint | Holds (month/day stack vs Goals type-code) |
| vs Goals/Athlete sameness | Not flagged — shared hub chrome with clear content fingerprint |

## Count

0 critical · 0 major · 2 minor

## What works

Upcoming-only list honesty; date tiles; detail countdown in brand; linked goals navigate into Goals hub; lite create + secondary web manage; shared `Button` / skeletons / semantic tokens.
