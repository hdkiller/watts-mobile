# Hallmark audit · Hydration quick-add

- **Wave:** B
- **Pri:** P2
- **Route/file:** `src/features/nutrition/HydrationQuickAddSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

- **Tell:** `design-system drift` — raw palette / mid-render improvisation  
  **Where:** ~88 (`tintColor="#60a5fa"`)  
  **Severity:** critical  
  **Fix:** Use a semantic hydration/recovery token (`Colors.recovery` or a named nutrition token in `colors.ts`) — never hard-coded sky hex (same debt as Nutrition glance).

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** L1  
  **Severity:** major  
  **Fix:** Stamp with `design-system: docs/DESIGN.md`.

- **Tell:** Decorative icon circles on every preset row  
  **Where:** ~118–120 (`rounded-full` + drop glyph + emoji fallback)  
  **Severity:** major  
  **Fix:** Drop circle badges; volume label + subcopy is enough (text-first). Keep one header glyph max if needed.

## Minor

- **Tell:** Emoji fallback as icon seasoning (`💧`)  
  **Where:** ~88, ~119  
  **Severity:** minor  
  **Fix:** MD/SF pair only via `AppSymbol`, or omit glyph.

- **Tell:** Title weight/size drift (`text-xl font-bold` vs card/hero scale)  
  **Where:** ~89  
  **Severity:** minor  
  **Fix:** Prefer `text-2xl`/`text-lg font-semibold text-text-primary` per DESIGN type scale.

- **Tell:** Prefer `AnimatedPressable` for Close / preset rows  
  **Where:** ~91–93, ~106–121  
  **Severity:** minor  
  **Fix:** Animated press; keep `hitSlop` on Close.

## Notes

- Semantic sheet chrome (`bg-surface`, card rows, success tint) and haptics map correctly.
- In-place `ActivityIndicator` while mutating is allowed (not a full-screen load).
- Success card uses `bg-tint-success` / `text-green-400` — on-system.

**Counts:** 1 critical · 2 major · 3 minor
