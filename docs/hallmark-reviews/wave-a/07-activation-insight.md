# Hallmark audit · First insight

- **Wave:** A
- **Pri:** P0
- **Route/file:** `app/(activation)/insight.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Honest empty state and restrained “Coming up” list — no invented metrics. Initial load uses a spinner instead of a list skeleton, and the surface under-delivers a personalized “insight” reveal (session list only).

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(activation)/insight.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `app/(activation)/insight.tsx` ~L62–65
  - **Severity** — major
  - **Fix** — Use `ListSkeleton` (or matching card placeholders) while `fetchUpcomingPlanned` runs.

## Minor

- **Tell** — `dishonest empty/error` (thin insight promise)
  - **Where** — `app/(activation)/insight.tsx` ~L56–60 vs ~L67–82
  - **Severity** — minor
  - **Fix** — Add one real personalized line from status/plan (or retitle to match “upcoming week” list so the promise matches content).

- **Tell** — `design-system drift` (spinner tint / error chrome)
  - **Where** — `app/(activation)/insight.tsx` ~L64, L86
  - **Severity** — minor
  - **Fix** — Brand-tint ActivityIndicator if kept for inline waits; errors → tinted card.

## Count

0 critical · 2 major · 2 minor

## What works

Empty copy is honest (“materializing”); section kicker pattern is close to system; cards use semantic borders; Continue uses `Button`; no decorative icons; no dashboard stats invented.
