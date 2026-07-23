# Hallmark audit · Tab bar

- **Wave:** D
- **Pri:** P3
- **Route/file:** `app/(app)/(tabs)/_layout.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal (app companion)
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Summary

Native tab chrome (`NativeTabs`) wired to semantic theme tokens — brand selected, muted default, surface background. IA matches product (**Today · Log · Coach · More**). Unread badge on More is restrained (`9+` cap).

## Critical

_None._

## Major

- **Tell** — `missing system reference`
  - **Where** — `app/(app)/(tabs)/_layout.tsx` (file top; no stamp)
  - **Severity** — major
  - **Fix** — Add Hallmark stamp with `design-system: docs/DESIGN.md` (chrome surfaces still get a stamp).

## Minor

- **Tell** — Tab-swap haptics not owned here
  - **Where** — `_layout.tsx` (NativeTabs triggers; no `hapticLight` call)
  - **Severity** — minor
  - **Fix** — If platform/native tabs don’t fire selection haptics, add a light haptic on tab focus change per DESIGN Haptic Feedback Map.

## Count

0 critical · 1 major · 1 minor

## What works

Uses `useThemeColors()` for tint/label/background — no raw neutrals. Icons are platform tab requirements (not decorative menu circles). `labelVisibilityMode="labeled"` avoids Material selected-only misalignment. No dashboard chrome.
