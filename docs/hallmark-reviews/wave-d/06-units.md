# Hallmark audit · Units

- **Wave:** D
- **Pri:** P3
- **Route/file:** `app/(app)/(tabs)/more/settings/units.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Practical units/locale form with brand chips (`text-ink` on brand — contrast rule OK) and shared `Button` save. Full-screen spinner on load; success uses off-system `text-emerald-400`; no stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/more/settings/units.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — ~L132–136
  - **Severity** — major
  - **Fix** — Skeleton for the choice card + timezone block.

- **Tell** — `design-system drift` (`text-emerald-400`)
  - **Where** — ~L268–270
  - **Severity** — major
  - **Fix** — Use `text-green-400` / `text-success` per DESIGN success states.

## Minor

- **Tell** — `dishonest empty/error` (load error chrome)
  - **Where** — ~L137–143
  - **Severity** — minor
  - **Fix** — Tinted error card (`border-danger/40 bg-tint-error`) around message + `Button`.

## Count

0 critical · 3 major · 1 minor

## What works

Chip contrast correct; timezone search is honest; brand text links for device timezone / Change; `Button` loading state; semantic inputs/borders.
