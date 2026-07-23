# Hallmark audit · More actions sheet

- **Wave:** B
- **Pri:** P2
- **Route/file:** `src/features/today/more-actions-sheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `more-actions-sheet.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp with `design-system: docs/DESIGN.md` when polishing overflow chrome.

- **Tell:** Hand-rolled Cancel bypasses shared `Button`  
  **Where:** ~47–54 (`rounded-xl border border-border-strong` Cancel)  
  **Severity:** major  
  **Fix:** Use `Button` `variant="secondary"` for Cancel; keep action rows as list pressables.

## Minor

- **Tell:** Sheet horizontal padding `px-5` vs screen norm `px-6`  
  **Where:** ~28  
  **Severity:** minor  
  **Fix:** Align sheet inset to `px-6`.

- **Tell:** Prefer `AnimatedPressable` over raw `Pressable` + `active:opacity-70`  
  **Where:** action rows ~31–45; Cancel ~47–54  
  **Severity:** minor  
  **Fix:** Swap to `AnimatedPressable` (haptic already correct via `hapticLight`).

## Notes

- Semantic `bg-surface` / `border-border` / grabber — on-system.
- Text-first action labels (no icon circles) — matches DESIGN “text is default.”
- A11y roles/labels present on Close / actions / Cancel.

**Counts:** 0 critical · 2 major · 2 minor
