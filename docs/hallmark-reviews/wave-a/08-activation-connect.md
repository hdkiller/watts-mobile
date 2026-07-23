# Hallmark audit · Connect last

- **Wave:** A
- **Pri:** P0
- **Route/file:** `app/(activation)/connect.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Connect-last matches product intent: Health Sync primary, Connected Apps secondary, Skip first-class, honest footer. Cleanest activation surface in Wave A aside from the missing DESIGN.md stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(activation)/connect.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md`.

## Minor

- **Tell** — `first-viewport decision overload` (post-attempt stack)
  - **Where** — `app/(activation)/connect.tsx` ~L79–108
  - **Severity** — minor
  - **Fix** — After a connection attempt, elevate a single “Continue to Today” primary and demote/skip-collapse the other secondaries so the next step is obvious.

- **Tell** — `dishonest empty/error` (error chrome)
  - **Where** — `app/(activation)/connect.tsx` ~L111
  - **Severity** — minor
  - **Fix** — Tinted error card for finish/skip failures.

## Count

0 critical · 1 major · 2 minor

## What works

Optional framing is explicit; Skip is always available; all actions go through `Button`; semantic tokens throughout; no spinner on mount; footer explains plan works without a device — honest empty path.
