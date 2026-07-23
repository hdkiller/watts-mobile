# Hallmark audit · Sports list

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/sports/index.tsx` + `src/features/sports/SportsSection.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Text-first sport profile list with strong error chrome (`tint-error`) and honest empty. Loading still uses a spinner; neither shell nor section is stamped.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/sports/index.tsx` + `SportsSection.tsx` (no stamps)
  - **Severity** — major
  - **Fix** — Stamp shell (and section if redesign-owned) with `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `SportsSection.tsx` ~L37–42
  - **Severity** — major
  - **Fix** — `ListSkeleton` matching profile cards.

## Minor

- **Tell** — press primitive
  - **Where** — `SportsSection.tsx` ~L80–88
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable`.

## Count

0 critical · 2 major · 1 minor

## What works

Text-default list (no emoji circles); Default chip restrained; threshold summary readable; error card matches DESIGN; web Sport Settings link brand-colored.
