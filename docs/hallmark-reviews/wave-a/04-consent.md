# Hallmark audit · Consent

- **Wave:** A
- **Pri:** P0
- **Route/file:** `app/(activation)/consent.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Focused legal/health consent with two switch rows and a gated Continue — matches field-companion “one job.” Missing stamp and error chrome are the main DESIGN.md gaps; tokens and `Button` usage are clean.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(activation)/consent.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md`.

## Minor

- **Tell** — `dishonest empty/error` (error chrome)
  - **Where** — `app/(activation)/consent.tsx` ~L81
  - **Severity** — minor
  - **Fix** — Present submit failures in tinted error card with Retry, not bare `text-red-400`.

- **Tell** — `design-system drift` (switch a11y)
  - **Where** — `app/(activation)/consent.tsx` ~L67, L77
  - **Severity** — minor
  - **Fix** — Wire `accessibilityLabel` on each `Switch` to the row title (Terms & privacy / Health data).

## Count

0 critical · 1 major · 2 minor

## What works

Title scale matches DESIGN (`text-2xl font-semibold`); card rows use `border-border bg-card`; Terms/Privacy are brand text links; Continue disabled until both consents; no decorative icon noise; no spinner for initial paint.
