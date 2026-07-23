# Hallmark audit · Settings hub

- **Wave:** D
- **Pri:** P2
- **Route/file:** `app/(app)/(tabs)/more/settings/index.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Clear preference hub with live detail strings (health, theme, log defaults, integrations). Same More-menu pattern of circular emoji badges creates decorative icon noise; no system stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/more/settings/index.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `decorative icon noise` (emoji icon circles on every row)
  - **Where** — `app/(app)/(tabs)/more/settings/index.tsx` ~L26–32 (`RowIcon`), all `MenuRow`s ~L223–335
  - **Severity** — major
  - **Fix** — Remove badge circles + emoji; keep title/detail/chevron (match DESIGN “icons seasoning”).

## Minor

- **Tell** — press primitive
  - **Where** — `MenuRow` ~L99–108
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable` over `active:opacity-80` `Pressable`.

## Count

0 critical · 2 major · 1 minor

## What works

Semantic tokens throughout; section headers match type scale; health/connected-apps details stay honest; instance/delete flows use system alerts + web handoff; no full-screen spinner on a mostly-static hub.
