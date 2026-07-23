# Hallmark audit · Sport detail

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/sports/[id].tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Straightforward threshold editor with keyboard overlap handling and primary `Button` save. Gaps: spinner load, hand-rolled secondary CTAs, emerald success, thin error chrome, missing stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/sports/[id].tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — ~L101–104
  - **Severity** — major
  - **Fix** — Field-shaped skeleton for FTP/LTHR/Max HR.

- **Tell** — one-off button styles
  - **Where** — ~L183–195 (Open Sport Settings / Cancel bordered `Pressable`s)
  - **Severity** — major
  - **Fix** — `Button variant="secondary"` (and cancel as secondary or text).

- **Tell** — `design-system drift` (`text-emerald-400`)
  - **Where** — ~L172–174
  - **Severity** — major
  - **Fix** — `text-green-400` / `text-success`.

- **Tell** — `dishonest empty/error` (load error chrome)
  - **Where** — ~L105–113 (plain `text-red-400` + text Retry)
  - **Severity** — major
  - **Fix** — Tinted error card + brand Retry / `Button`.

## Minor

- **Tell** — duplicate title chrome
  - **Where** — Stack title + in-page H1 ~L100–133
  - **Severity** — minor
  - **Fix** — One title.

## Count

0 critical · 5 major · 1 minor

## What works

Semantic inputs; validation haptic; missing-profile empty with Back link; pace helper text; Save uses shared `Button`.
