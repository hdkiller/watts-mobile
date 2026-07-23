# Hallmark audit · Appearance

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/(tabs)/more/settings/appearance.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Clean three-option theme picker with haptics and correct brand/ink contrast on the selected radio. Main gap is missing Hallmark stamp; otherwise close to DESIGN settings chrome.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/more/settings/appearance.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

## Minor

- **Tell** — duplicate title chrome
  - **Where** — Stack title + in-page `text-2xl` ~L42–56
  - **Severity** — minor
  - **Fix** — Keep either nav title or page H1, not both.

- **Tell** — press primitive
  - **Where** — option rows ~L66–74
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable` for selection rows.

## Count

0 critical · 1 major · 2 minor

## What works

Semantic card/list; outdoor-light copy; `hapticLight` on change; selected control uses brand fill with dark center (no white-on-brand); no spinner needed.
