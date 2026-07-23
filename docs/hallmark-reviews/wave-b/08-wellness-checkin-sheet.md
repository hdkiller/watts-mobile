# Hallmark audit · Wellness check-in sheet
- **Wave:** B
- **Pri:** P0
- **Route/file:** `src/features/log/WellnessCheckinSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `WellnessCheckinSheet.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp after polish.

## Minor

- **Tell:** `decorative icon noise` (⚡ in Prefill label)  
  **Where:** ~202–204  
  **Severity:** minor  
  **Fix:** Plain “Prefill from Health Sync” (optional `AppSymbol` bolt, no emoji).

- **Tell:** Prefill control is a `rounded-full` chip (`pill cluster` seed)  
  **Where:** ~195–205  
  **Severity:** minor  
  **Fix:** Text link `text-sm font-semibold text-brand` with `hitSlop={8}`.

- **Tell:** Prefer `AnimatedPressable` for Cancel / Prefill  
  **Where:** ~188–190, ~195–205  
  **Severity:** minor  
  **Fix:** Swap to `AnimatedPressable`.

- **Tell:** Cancel uses `text-text-muted` vs sheet convention brand Close  
  **Where:** ~188–190  
  **Severity:** minor  
  **Fix:** Match other sheets: brand “Cancel” / “Done”.

- **Tell:** Prefill Pressable lacks `hitSlop`  
  **Where:** ~195–205  
  **Severity:** minor  
  **Fix:** Add `hitSlop={8}`.

## Notes

- Disciplined write surface: shared `Button` sticky CTA, honest validation error, offline save notice, score cards as the interaction (cards OK).
- No full-screen spinner; Health busy is inline copy.
- Four subjective metrics + sleep/weight is dense but appropriate for a &lt;20s check-in — not a dashboard clone.

**Counts:** 0 critical · 1 major · 5 minor
