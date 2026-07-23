# Hallmark audit · Coach identity

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/(tabs)/more/settings/coach.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Useful lite form (nickname, About me, persona chips, tool approval) with honest AI-unavailable web handoff. Full-screen spinner, hand-rolled secondary CTA, emerald success color, and missing stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/more/settings/coach.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — ~L108–112
  - **Severity** — major
  - **Fix** — Form-shaped skeleton (fields + chip row).

- **Tell** — one-off button style
  - **Where** — ~L250–255 (“Open Profile Settings” bordered `Pressable`)
  - **Severity** — major
  - **Fix** — Use shared `Button` `variant="secondary"` (DESIGN: no new one-off button styles).

- **Tell** — `design-system drift` (`text-emerald-400`)
  - **Where** — ~L239–241
  - **Severity** — major
  - **Fix** — `text-green-400` / `text-success`.

## Minor

- **Tell** — duplicate title chrome
  - **Where** — Stack + in-page H1 ~L103–137
  - **Severity** — minor
  - **Fix** — One title.

- **Tell** — `dishonest empty/error` (load error chrome)
  - **Where** — ~L113–130
  - **Severity** — minor
  - **Fix** — Tinted error card around message + `Button`.

## Count

0 critical · 4 major · 2 minor

## What works

Persona chips respect brand/ink contrast; Switch track brand; haptics on save; AI-unavailable card is honest; primary Save uses `Button`.
