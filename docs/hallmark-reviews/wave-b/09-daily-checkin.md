# Hallmark audit · Daily coach check-in
- **Wave:** B
- **Pri:** P1
- **Route/file:** `app/(app)/daily-checkin.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `daily-checkin.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp after pass.

- **Tell:** `spinner instead of skeleton` (large centered spinner while generating)  
  **Where:** ~183–194 (`ActivityIndicator` size large)  
  **Severity:** major  
  **Fix:** Keep `DetailSkeleton` (or question-card skeleton) for the entire generate/poll wait — DESIGN: skeletons for full-screen loads.

- **Tell:** `design-system drift` (raw hex placeholder)  
  **Where:** ~291 `placeholderTextColor="#71717a"`  
  **Severity:** major  
  **Fix:** Use `useThemeColors().textMuted` (as Refine sheet does).

## Minor

- **Tell:** Prefer `AnimatedPressable` for YES/NO chips  
  **Where:** ~246–277  
  **Severity:** minor  
  **Fix:** `AnimatedPressable` + ensure ≥44pt height / hitSlop.

- **Tell:** YES/NO selected chrome is custom (acceptable) but NO uses raw `red-500` classes  
  **Where:** ~264–273  
  **Severity:** minor  
  **Fix:** Prefer `border-danger` / `text-danger` tokens.

- **Tell:** Title `font-bold` vs `font-semibold` scale  
  **Where:** ~228  
  **Severity:** minor  
  **Fix:** Align type scale.

## Notes

- Initial load uses `DetailSkeleton` — good; regression is the mid-flow generating spinner.
- Empty / quota / timeout states are honest with `Button` exits.
- Submit correctly gated on all answers via shared `Button`.

**Counts:** 0 critical · 3 major · 3 minor
