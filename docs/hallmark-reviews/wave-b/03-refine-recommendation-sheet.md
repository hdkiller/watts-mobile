# Hallmark audit · Refine recommendation sheet
- **Wave:** B
- **Pri:** P1
- **Route/file:** `src/features/today/RefineRecommendationSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `RefineRecommendationSheet.tsx` L1  
  **Severity:** major  
  **Fix:** Add Hallmark stamp when polishing; surface is otherwise on-system.

## Minor

- **Tell:** Prefer `AnimatedPressable` over `Pressable` Cancel  
  **Where:** ~46–48  
  **Severity:** minor  
  **Fix:** Swap to `AnimatedPressable` (hitSlop already set).

- **Tell:** Sheet horizontal padding `px-5` vs screen norm `px-6`  
  **Where:** header/footer ~39, ~51, ~71  
  **Severity:** minor  
  **Fix:** Align sheet chrome to `px-6` for consistency with DESIGN layout.

## Notes

- Disciplined: semantic surfaces, shared `Button`, clear optional feedback → “Refine Plan” / “Refresh Data”, muted section kicker matches type scale.
- No spinner/skeleton issue (submit loading lives on `Button`).
- No card-in-card, emoji noise, or dashboard metrics.

**Counts:** 0 critical · 1 major · 2 minor
