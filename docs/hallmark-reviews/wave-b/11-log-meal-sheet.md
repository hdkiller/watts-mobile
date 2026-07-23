# Hallmark audit · Log meal sheet
- **Wave:** B
- **Pri:** P1
- **Route/file:** `src/features/nutrition/LogMealSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `LogMealSheet.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp after pass (photo flow screen already stamped separately).

- **Tell:** `decorative icon noise` / emoji-as-icon (meal slots + history chips)  
  **Where:** `MEAL_ICONS` ~64–70; `MealSlotPicker` ~287; history ~1130  
  **Severity:** major  
  **Fix:** Text labels only (or `AppSymbol`); drop 🥣🥗🍽️🍎🍴 / history emoji.

- **Tell:** `pill cluster clutter` (horizontal recent-food chips)  
  **Where:** ~1111–1147  
  **Severity:** major  
  **Fix:** Vertical recent list (2–3 rows) or a single “Recent” disclosure — not a scrolling pill runway.

- **Tell:** `design-system drift` (macro bar / legend raw `amber-500` / `emerald-500` / `rose-500`)  
  **Where:** `MacroRatioBar` ~97–118; confidence borders ~1007–1029  
  **Severity:** major  
  **Fix:** Map macros to semantic chart/zone or brand/recovery/modify tokens; confidence via border-brand / border-modify / border-danger.

- **Tell:** Detected-component chip strip adds second pill cluster in review  
  **Where:** `DetectedItemsChips` ~125–160  
  **Severity:** major  
  **Fix:** Simple removable rows (hairline list), not wrap chips.

## Minor

- **Tell:** Analyzing uses large `ActivityIndicator` (in-place wait — DESIGN-allowed; still spinner-forward)  
  **Where:** ~951–971  
  **Severity:** minor  
  **Fix:** Optional photo + text skeleton pulse instead of spinner.

- **Tell:** Prefer `AnimatedPressable` for Cancel, meal slots, history, photo entry, Clear estimate  
  **Where:** header ~911; MealSlotPicker ~277; history ~1123; photo CTA ~1167; clear ~1056  
  **Severity:** minor  
  **Fix:** Animated press; add `hitSlop` on Clear estimate.

- **Tell:** Compose sheet stacks targets card + history + slots + photo CTA (busy first open)  
  **Where:** compose branch ~1097–1207  
  **Severity:** minor  
  **Fix:** Lead with name/slot + Save; tuck history/photo under progressive disclosure.

## Notes

- Logged success state matches DESIGN success guidance (checkmark, real values, no confetti) — strong.
- Shared `Button` for primary save paths; brand/ink contrast on success mark is correct.
- Screen presentation path for photo is clearer than the dense sheet compose mode.

**Counts:** 0 critical · 5 major · 3 minor
