# Hallmark audit · Plan lite

- **Wave:** A
- **Pri:** P0
- **Route/file:** `app/(activation)/plan.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Form → working → preview flow is the right narrative for plan lite, and preview/empty honesty is good. The form packs three control groups plus dual CTAs on first paint, and the working phase swaps the whole surface for a centered spinner instead of a skeleton preview layout.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(activation)/plan.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md`.

- **Tell** — `first-viewport decision overload`
  - **Where** — `app/(activation)/plan.tsx` ~L121–211 (form phase)
  - **Severity** — major
  - **Fix** — Sequence days → volume → sports (or collapse secondary controls) so one decision leads; keep a single primary CTA above the web handoff.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `app/(activation)/plan.tsx` ~L127–139
  - **Severity** — major
  - **Fix** — Replace centered `ActivityIndicator` with a week-preview skeleton (list rows matching preview cards).

## Minor

- **Tell** — `design-system drift` (spinner tint / chips)
  - **Where** — `app/(activation)/plan.tsx` ~L129; chip Pressables ~L149–192
  - **Severity** — minor
  - **Fix** — Tint spinner with brand; add `hapticLight` + `AnimatedPressable` on day/volume/sport chips.

- **Tell** — `dishonest empty/error` (error chrome)
  - **Where** — `app/(activation)/plan.tsx` ~L196, L233
  - **Severity** — minor
  - **Fix** — Use tinted error card for generate/activate failures.

## Count

0 critical · 3 major · 2 minor

## What works

Selected chips use `bg-brand-action` + `text-ink` (contrast rule); preview copy is provisional/honest; web handoff is secondary; semantic cards for preview rows; Activate/Back use shared `Button`.
