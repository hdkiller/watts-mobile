# Hallmark audit · Health workouts

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/health-workouts.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Useful phone-vs-synced list with Sync/Resync actions via shared `Button` and honest empty. Full-screen spinner + non-semantic status colors; no stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/health-workouts.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — ~L199–203
  - **Severity** — major
  - **Fix** — `ListSkeleton` for workout cards; keep row `ActivityIndicator` for in-place sync.

- **Tell** — `design-system drift` (emerald/amber status + banner)
  - **Where** — `statusColor` ~L32–46; sync-off banner ~L171–177 (`amber-*`)
  - **Severity** — major
  - **Fix** — Use `text-success` / `text-modify` / `text-danger` (+ tint banner tokens).

## Minor

- **Tell** — action error as bare red text
  - **Where** — ~L191–196
  - **Severity** — minor
  - **Fix** — Compact tinted error strip near the Sync-all control.

## Count

0 critical · 3 major · 1 minor

## What works

Honest empty; platform label; uploads-disabled callout links to Health Sync; Sync all / per-row Sync via `Button`; pull-to-refresh brand tint.
