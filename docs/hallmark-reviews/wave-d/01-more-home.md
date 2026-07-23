# Hallmark audit · More home

- **Wave:** D
- **Pri:** P1
- **Route/file:** `app/(app)/(tabs)/more/index.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Solid account hub IA (profile card → sections → version). Semantic surfaces/cards mostly correct. The screen fights DESIGN’s “text is default, icons seasoning” with a circular emoji/AppSymbol badge on every menu row, and lacks a Hallmark system stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/more/index.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add `/* Hallmark · … design-system: docs/DESIGN.md */` stamp matching stamped app screens.

- **Tell** — `decorative icon noise` (emoji icon circles on every menu row)
  - **Where** — `app/(app)/(tabs)/more/index.tsx` ~L35–50 (`RowIcon`), used by every `MenuRow` ~L262–351
  - **Severity** — major
  - **Fix** — Drop circular badges + emoji fallbacks; keep chevron + title/detail only (status color sparingly if needed).

- **Tell** — `design-system drift` (raw hex danger tint)
  - **Where** — `app/(app)/(tabs)/more/index.tsx` ~L46 (`tintColor={… '#ef4444'}`)
  - **Severity** — major
  - **Fix** — Use `Colors.danger` / theme danger token instead of hardcoded `#ef4444`.

## Minor

- **Tell** — `design-system drift` (press primitive)
  - **Where** — `app/(app)/(tabs)/more/index.tsx` ~L143–151, L229–234
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable` over raw `Pressable` + `active:opacity-80`.

- **Tell** — nested interactive targets
  - **Where** — `app/(app)/(tabs)/more/index.tsx` ~L229–259 (refresh control inside profile `Pressable`)
  - **Severity** — minor
  - **Fix** — Move refresh outside the profile navigation target (or use a single labeled control).

## Count

0 critical · 3 major · 2 minor

## What works

Semantic `bg-surface` / `bg-card` / `text-text-*`; section headers match type scale; profile card is one clear entry; About/session rows honest; version footer quiet; `AppSymbol` used (when icons stay).
