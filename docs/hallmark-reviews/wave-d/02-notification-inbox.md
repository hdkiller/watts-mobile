# Hallmark audit · Notification inbox

- **Wave:** D
- **Pri:** P1
- **Route/file:** `app/(app)/(tabs)/more/notifications.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Readable list with unread brand dots and honest empty copy. Violates skeleton-loading rule with a full-screen spinner; no Hallmark stamp; error chrome is thinner than DESIGN States.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/more/notifications.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp referencing `docs/DESIGN.md`.

- **Tell** — `spinner instead of skeleton`
  - **Where** — `app/(app)/(tabs)/more/notifications.tsx` ~L148–151
  - **Severity** — major
  - **Fix** — Replace full-screen `ActivityIndicator` with `ListSkeleton` (or layout-matching placeholders).

## Minor

- **Tell** — `dishonest empty/error` (error chrome not per system)
  - **Where** — `app/(app)/(tabs)/more/notifications.tsx` ~L152–160
  - **Severity** — minor
  - **Fix** — Use `border-danger/40 bg-tint-error` card + brand Retry (`font-semibold`) per DESIGN States.

- **Tell** — `decorative icon noise` (empty-state icon circle)
  - **Where** — `app/(app)/(tabs)/more/notifications.tsx` ~L175–178
  - **Severity** — minor
  - **Fix** — Lead with the honest one-liner; drop or demote the bell-slash circle.

- **Tell** — press primitive
  - **Where** — rows ~L59–66
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable` + consistent `hitSlop` on header actions.

## Count

0 critical · 2 major · 3 minor

## What works

Unread vs read hierarchy is clear; repeat muted titles; pull-to-refresh; empty copy explains when items appear; semantic card borders; Mark-all as brand text link.
