# Hallmark audit · Boot redirect

- **Wave:** A
- **Pri:** P3
- **Route/file:** `app/index.tsx` (+ authenticated branch `src/linking/AuthenticatedEntry.tsx`)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Auth gate with no composition — redirects to instance / login / `AuthenticatedEntry`. While auth is unresolved the index returns blank `null`; once authenticated, entry shows a centered full-screen spinner until activation / deep-link resolve.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/index.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md` on the boot shell (and/or `AuthenticatedEntry`).

- **Tell** — `spinner instead of skeleton` / blank boot flash
  - **Where** — `app/index.tsx` ~L21 (`return null`); `AuthenticatedEntry.tsx` ~L44–49 (`ActivityIndicator`)
  - **Severity** — major
  - **Fix** — Show a minimal surface + layout-matching skeleton (or branded boot placeholder) for unresolved auth and activation resolve — never blank or full-screen spinner.

## Minor

_None._

## Count

0 critical · 2 major · 0 minor

## What works

No invented chrome; semantic redirects only; correct three-way auth branch. Composition debt lives on destination screens, not here.
