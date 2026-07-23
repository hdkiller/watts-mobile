# Hallmark audit · Training load sheet
- **Wave:** B
- **Pri:** P1
- **Route/file:** `src/features/performance/TrainingLoadSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `TrainingLoadSheet.tsx` L1  
  **Severity:** major  
  **Fix:** Add Hallmark stamp after pass.

- **Tell:** `spinner instead of skeleton`  
  **Where:** ~88–91  
  **Severity:** major  
  **Fix:** Skeleton matching summary tiles + chart block.

- **Tell:** Hand-rolled Retry / Open Performance bypass `Button`  
  **Where:** ~101–106, ~140–147  
  **Severity:** major  
  **Fix:** Use shared `Button` variants.

- **Tell:** `hit target undersized` (period chips `py-1.5`, no `hitSlop`)  
  **Where:** ~65–85  
  **Severity:** major  
  **Fix:** Increase vertical padding to ~44pt touch or `hitSlop={8}`; prefer `AnimatedPressable` + `hapticLight`.

- **Tell:** Error not DESIGN tinted error card  
  **Where:** ~92–107  
  **Severity:** major  
  **Fix:** `border-danger/40 bg-tint-error` + brand Retry link.

## Minor

- **Tell:** `pill cluster clutter` (30d / 60d / 90d chips)  
  **Where:** ~65–86  
  **Severity:** minor  
  **Fix:** Segmented control or single row of text tabs without `rounded-full` chrome overload.

- **Tell:** Prefer `AnimatedPressable` for Done / period / CTAs  
  **Where:** ~59–61, ~69–84, ~101–147  
  **Severity:** minor  
  **Fix:** Swap pressables.

- **Tell:** Summary tiles use `font-black` vs type scale  
  **Where:** `SummaryCard` ~166–171  
  **Severity:** minor  
  **Fix:** `font-semibold` / row-title scale.

- **Tell:** 2×2 CTL/ATL/TSB/Avg TSS grid edges toward dashboard clone (acceptable for PMC detail)  
  **Where:** ~110–117  
  **Severity:** minor  
  **Fix:** Lead with Form status + one primary number; keep others secondary.

## Notes

- Chart empty honesty (“Not enough training history…”) is good.
- Selected period chip correctly uses `text-ink` on `bg-brand`.
- Form status color via `formStatusTextClass` is intentional domain coloring.

**Counts:** 0 critical · 5 major · 4 minor
