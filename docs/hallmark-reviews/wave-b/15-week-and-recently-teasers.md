# Hallmark audit · Week strip + Recently teaser

- **Wave:** B
- **Pri:** P2
- **Route/file:** `src/features/today/week-glance-strip.tsx` + `src/features/today/recently-teaser.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** both files L1  
  **Severity:** major  
  **Fix:** Stamp each teaser (or a shared Today-teaser stamp comment) with `design-system: docs/DESIGN.md`.

## Minor

- **Tell:** Type-scale drift (`text-[10px]` weekday labels)  
  **Where:** `week-glance-strip.tsx` ~37  
  **Severity:** minor  
  **Fix:** Prefer `text-xs text-text-muted` (or omit labels and keep a11y on bars only).

- **Tell:** Prefer `AnimatedPressable` for “See all” / rows  
  **Where:** `recently-teaser.tsx` ~44–50, ~86–103  
  **Severity:** minor  
  **Fix:** Use `AnimatedPressable`; row already has full-width hit area — keep `hitSlop` on the text link.

- **Tell:** Error state hides the section (`return null`)  
  **Where:** `recently-teaser.tsx` ~34  
  **Severity:** minor  
  **Fix:** Honest muted one-liner + optional Retry instead of silent omission.

## Notes

- Section kickers match DESIGN (`text-xs font-semibold uppercase tracking-widest text-text-muted`).
- Week bars use semantic `bg-brand` / `bg-border-strong` / `bg-border` — no hex drift; restrained vs CTL heatmaps.
- Recently rows: hairline dividers, `SportIcon` size 13, metadata joined with ` · ` — on-system.
- Density pressure is compositional on Today home (already critical there), not these teasers alone.

**Counts:** 0 critical · 1 major · 3 minor
