# Hallmark audit · Activation index

- **Wave:** A
- **Pri:** P0
- **Route/file:** `app/(activation)/index.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Thin redirect shell — no composition to redesign. While status loads with no cached data it centers a full-screen spinner, which DESIGN.md forbids for initial loads (skeletons required).

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(activation)/index.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md` (even on redirect shells).

- **Tell** — `spinner instead of skeleton`
  - **Where** — `app/(activation)/index.tsx` ~L15–20
  - **Severity** — major
  - **Fix** — Replace centered `ActivityIndicator` with a layout-matching skeleton (or reuse activation gate skeleton shared with `_layout.tsx`).

## Minor

_None._

## Count

0 critical · 2 major · 0 minor

## What works

No invented UI chrome; correct redirect to step href or Today; semantic `bg-surface`. Note: `app/(activation)/_layout.tsx` ~L31–36 repeats the same full-screen spinner gate for the whole chapter.
