# Hallmark audit · Recovery event
- **Wave:** B
- **Pri:** P1
- **Route/file:** `app/(app)/recovery-event.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `recovery-event.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp after pass.

- **Tell:** `spinner instead of skeleton` (edit hydrate)  
  **Where:** ~242–247  
  **Severity:** major  
  **Fix:** Form-matching skeleton instead of centered `ActivityIndicator`.

- **Tell:** `design-system drift` (raw `rgba(0, 220, 130, 0.1)` + inline border colors in `selectStyles`)  
  **Where:** ~70–80  
  **Severity:** major  
  **Fix:** Use Tailwind `border-brand bg-brand/10` / `border-border bg-card/60` classes (or theme tokens), not improvised rgba.

- **Tell:** `decorative icon noise` (emoji fallbacks on every option + severity row)  
  **Where:** `OptionGlyph` ~83–106; option list ~336; severity ~374  
  **Severity:** major  
  **Fix:** `AppSymbol` only; omit emoji fallbacks in the list (or single letter).

- **Tell:** Hand-rolled Delete / Cancel bypass shared `Button` (+ raw `#f87171` spinner)  
  **Where:** Delete ~457–467; Cancel ~472–477  
  **Severity:** major  
  **Fix:** `Button variant="danger"` / `secondary`; spinner via Button loading.

- **Tell:** `pill cluster clutter` (time presets `rounded-full`)  
  **Where:** ~391–416  
  **Severity:** major  
  **Fix:** Segmented list or rectangular chips with ≥44pt targets + hitSlop.

## Minor

- **Tell:** Prefer `AnimatedPressable` for option / severity / time / cancel  
  **Where:** throughout selection UI ~320–477  
  **Severity:** minor  
  **Fix:** Animated press + hapticLight already on some — extend consistently.

- **Tell:** Time preset chips may undershoot 44pt without hitSlop  
  **Where:** ~395–415  
  **Severity:** minor  
  **Fix:** Add `hitSlop={8}` or increase padding.

## Notes

- Progressive disclosure (browse options → unlock details) is a strong Narrative Workflow shape — keep structure, fix tokens/chrome.
- Read-only imported / missing event empties are honest.
- Primary save correctly uses `Button`.

**Counts:** 0 critical · 6 major · 2 minor
