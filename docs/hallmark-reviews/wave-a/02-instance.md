# Hallmark audit · Instance URL

- **Wave:** A
- **Pri:** P1
- **Route/file:** `app/(auth)/instance.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Clear single-job form (URL → Continue) with semantic surfaces and honest error strings. Violates the shared-button rule by hand-rolling the primary CTA, and lacks a DESIGN.md stamp.

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(auth)/instance.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md`.

- **Tell** — `design-system drift` (one-off button)
  - **Where** — `app/(auth)/instance.tsx` ~L68–78
  - **Severity** — major
  - **Fix** — Replace hand-rolled `Pressable` + inline `ActivityIndicator` with shared `Button` (`loading` / `disabled`).

## Minor

- **Tell** — `design-system drift` (press / cancel chrome)
  - **Where** — `app/(auth)/instance.tsx` ~L80–86
  - **Severity** — minor
  - **Fix** — Use `Button variant="secondary"` or `AnimatedPressable` + `hitSlop={8}` instead of raw `active:opacity-80` Pressable.

- **Tell** — `dishonest empty/error` (error chrome)
  - **Where** — `app/(auth)/instance.tsx` ~L66
  - **Severity** — minor
  - **Fix** — Use tinted error card (`border-danger/40 bg-tint-error`) instead of bare `text-red-400`.

## Count

0 critical · 2 major · 2 minor

## What works

One decision (instance URL); `KeyboardAvoidingView` for standalone screen; input uses `border-border-strong` + `bg-card` + theme placeholder; Continue label uses `text-ink` on brand-action (contrast rule respected); no dashboard clutter.
