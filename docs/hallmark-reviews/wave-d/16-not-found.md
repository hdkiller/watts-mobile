# Hallmark audit · Not found

- **Wave:** D
- **Pri:** P3
- **Route/file:** `app/+not-found.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Honest dead-end with semantic surface/text — minimal as required for system chrome. Needs a Hallmark stamp and a slightly more companion-grade CTA.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/+not-found.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

## Minor

- **Tell** — CTA not via shared `Button`
  - **Where** — ~L10–12 (`Link` + brand text)
  - **Severity** — minor
  - **Fix** — Prefer `Button` primary “Go home” (or brand link with `hitSlop={8}` + `font-semibold`).

- **Tell** — thin empty copy
  - **Where** — ~L9
  - **Severity** — minor
  - **Fix** — One muted supporting line (“That screen isn’t in the companion.”).

## Count

0 critical · 1 major · 2 minor

## What works

No decorative noise; semantic `bg-surface` / `text-text-primary`; no fake dashboard; centered single decision.
