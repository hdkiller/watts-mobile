# Hallmark audit · Recommendation detail sheet
- **Wave:** B
- **Pri:** P0
- **Route/file:** `src/features/today/RecommendationDetailSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `RecommendationDetailSheet.tsx` L1  
  **Severity:** major  
  **Fix:** Add Hallmark stamp after pass.

- **Tell:** `design-system drift` (raw sky/amber/green palette shells for recovery origin badges)  
  **Where:** `sourceBadgeClass` ~32–40; applied ~176–180; suggested plan `tintClass` ~239 (`border-sky-800/40 bg-sky-950/25`)  
  **Severity:** major  
  **Fix:** Use semantic `bg-card` / `border-border` + text-muted labels, or shared recovery/modify tokens — no raw `*-950` / `sky-*` in components.

- **Tell:** Origin badge label lacks explicit text color class (inherits poorly across themes)  
  **Where:** ~179 `<Text className="text-xs">{item.origin}</Text>`  
  **Severity:** major  
  **Fix:** Put color on the `Text` via tokens (`text-text-muted` or tone-specific semantic), not only on the wrapper string.

## Minor

- **Tell:** Prefer `AnimatedPressable` over `Pressable` Close  
  **Where:** ~130–132  
  **Severity:** minor  
  **Fix:** Use `AnimatedPressable` (hitSlop already present).

- **Tell:** `pill cluster clutter` (rounded-full origin chips per recovery row)  
  **Where:** ~174–180  
  **Severity:** minor  
  **Fix:** Inline muted origin as metadata (` · Imported`) instead of pills.

- **Tell:** Meta join uses ` • ` instead of DESIGN `' · '`  
  **Where:** `PlanCard` ~61  
  **Severity:** minor  
  **Fix:** Join with `' · '`.

## Notes

- Empty state (“No recommendation details available.”) is honest.
- Accept/Close footers correctly use shared `Button`.
- Action badge + Why / drivers structure is field-companion appropriate once palette drift is fixed.

**Counts:** 0 critical · 3 major · 3 minor
