# Hallmark audit · Health history

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/health-history.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Local ledger list with Retry and Sync now — good companion tools. Status colors drift off semantic success/modify; filter chips are a small pill cluster; no stamp. No network spinner (ledger is local) — fine.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/health-history.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `design-system drift` (emerald/amber status)
  - **Where** — `statusColor` ~L23–35
  - **Severity** — major
  - **Fix** — Map to `text-success` / `text-modify` / `text-danger` / `text-brand`.

## Minor

- **Tell** — `pill cluster`
  - **Where** — `FilterChip` ~L53–73, usage ~L134–145 (`rounded-full` chips)
  - **Severity** — minor
  - **Fix** — Segment control with `rounded-lg` / border-strong, matching other settings choice rows.

- **Tell** — dual equal secondary CTAs
  - **Where** — Sync now + Resync all ~L147–159
  - **Severity** — minor
  - **Fix** — Primary Sync now; demote Resync all to brand text link or overflow.

## Count

0 critical · 2 major · 2 minor

## What works

Honest empty; Retry via `Button`; error lines on items; kind/platform metadata; no invented metrics.
