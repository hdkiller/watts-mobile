# Hallmark audit · Health Sync

- **Wave:** D
- **Pri:** P1
- **Route/file:** `app/(app)/health-sync.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Important connect-last sibling with good `Button` usage and privacy copy. Heavy palette drift (emerald/amber/hex), decorative heart circle, and full-screen spinner; no stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/health-sync.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — ~L252–256
  - **Severity** — major
  - **Fix** — Card/status skeleton while reading auth status.

- **Tell** — `design-system drift` (emerald/amber/raw hex)
  - **Where** — `StatusBadge`/`PermissionRow` ~L32–84; heart `tintColor="#ef4444"` ~L271; amber copy ~L363, L462
  - **Severity** — major
  - **Fix** — Map to `success` / `modify` / `danger` (+ tint tokens); use `Colors.danger` for heart if kept.

- **Tell** — `decorative icon noise`
  - **Where** — platform card icon circle ~L267–274
  - **Severity** — major
  - **Fix** — Lead with title + `StatusBadge`; drop or shrink decorative heart circle.

## Minor

- **Tell** — glyph noise in permission rows
  - **Where** — ~L68–77 (✓/× in circles)
  - **Severity** — minor
  - **Fix** — Text status (“Granted”/“Denied”) with semantic color only.

- **Tell** — chevron as raw Text
  - **Where** — nav rows ~L484, L501 (`›`)
  - **Severity** — minor
  - **Fix** — Use `AppSymbol` chevron for consistency with More/Settings.

## Count

0 critical · 4 major · 2 minor

## What works

Primary/secondary/danger `Button` variants; sync toggles clear; last-sync honesty; privacy card; deep links to workouts/history; platform-specific connect paths.
