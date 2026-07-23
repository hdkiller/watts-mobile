# Hallmark audit · Goal lite

- **Wave:** A
- **Pri:** P0
- **Route/file:** `app/(activation)/goal.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Solid type-picker + title/date form using semantic cards and shared `Button`. First viewport stacks four mutually exclusive type cards plus two fields before the CTA — more simultaneous decisions than the companion “one decision” principle prefers — and the file has no system stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(activation)/goal.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md`.

- **Tell** — `first-viewport decision overload`
  - **Where** — `app/(activation)/goal.tsx` ~L78–126
  - **Severity** — major
  - **Fix** — Lead with type selection alone (advance or reveal title/date after pick) so the first viewport has one clear decision.

## Minor

- **Tell** — `design-system drift` (input border / chips)
  - **Where** — `app/(activation)/goal.tsx` ~L87–96, L100–116
  - **Severity** — minor
  - **Fix** — Use `border-border-strong` on inputs; prefer `AnimatedPressable` + `hapticLight()` on type chips.

- **Tell** — `dishonest empty/error` (error chrome)
  - **Where** — `app/(activation)/goal.tsx` ~L118
  - **Severity** — minor
  - **Fix** — Tinted error card per DESIGN States.

## Count

0 critical · 2 major · 2 minor

## What works

Honest supporting copy (“refine later”); selected type uses brand border; no raw zinc/white; Continue gated on title length; no full-screen spinner; hints stay text, not icon clusters.
