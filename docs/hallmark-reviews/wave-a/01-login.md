# Hallmark audit · Login

- **Wave:** A
- **Pri:** P0
- **Route/file:** `app/(auth)/login.tsx` (+ `src/features/auth/AuthAtmosphere.tsx`)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Brand-first door with semantic tokens, shared `Button`, and restrained enter motion — strong first contact. Gaps are system allegiance (no Hallmark stamp) and small state/link conventions vs DESIGN.md; no raw zinc/white palette drift in the screen itself.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(auth)/login.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add `/* Hallmark · … design-system: docs/DESIGN.md */` stamp matching stamped app screens.

## Minor

- **Tell** — `dishonest empty/error` (error chrome not per system)
  - **Where** — `app/(auth)/login.tsx` ~L150–154
  - **Severity** — minor
  - **Fix** — Wrap sign-in errors in `border-danger/40 bg-tint-error` card with brand Retry pattern per DESIGN States.

- **Tell** — `design-system drift` (inline link weight / press primitive)
  - **Where** — `app/(auth)/login.tsx` ~L125–144, L199–203
  - **Severity** — minor
  - **Fix** — Use `text-sm font-semibold text-brand` + prefer `AnimatedPressable` for Change URL / self-hosted / restore default links.

- **Tell** — `raw palette / non-semantic token` (related atmosphere)
  - **Where** — `src/features/auth/AuthAtmosphere.tsx` ~L11 (`theme.surface === '#fafafa' || … '#ffffff'`)
  - **Severity** — minor
  - **Fix** — Detect light via theme API / scheme flag, not hardcoded hex string compares.

## Count

0 critical · 1 major · 3 minor

## What works

Coach Watts is hero-level; copy stays field-companion; `Button` primary/secondary; semantic `bg-surface` / `text-text-*` / `bg-card`; legal links brand-colored; no full-screen spinner; atmosphere is soft brand wash without decorative icon noise.
