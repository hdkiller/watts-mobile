# Hallmark audit · Nutrition detail + macro explain

- **Wave:** B
- **Pri:** P1
- **Route/file:** `src/features/nutrition/NutritionDetailSheet.tsx` + `NutritionMacroExplainSheet.tsx` (body also renders `NutritionSection.tsx`)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

- **Tell:** `design-system drift` — raw macro accent palette  
  **Where:** `NutritionMacroExplainSheet.tsx` ~14–22 (`#fb923c` / `#fbbf24` / `#60a5fa` / `#a78bfa`, `bg-orange-400` / `bg-amber-400` / `bg-blue-400` / `bg-violet-400`); also inherited in `NutritionSection` bars/hydration tint when opened via detail sheet  
  **Severity:** critical  
  **Fix:** Same token lift as Nutrition glance — named macro/hydration colors in `colors.ts` + Tailwind; consume by token only.

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** both sheet files L1  
  **Severity:** major  
  **Fix:** Stamp both sheets (+ `NutritionSection` if stamped separately).

- **Tell:** Display type drift (`font-black` / ultra-tight uppercase)  
  **Where:** `NutritionMacroExplainSheet.tsx` ~80–86, ~92–97, ~116–117  
  **Severity:** major  
  **Fix:** Align to DESIGN scale (`font-semibold` titles, `text-xs uppercase tracking-widest` kickers) — drop `font-black` poster weight.

- **Tell:** Decorative icon + emoji seasoning on analysis chrome  
  **Where:** macro header ~74–79; calculation kicker ~110–115; coach tip ~154 (`fallback="💡"`); detail path via `NutritionSection` drop/`💧`  
  **Severity:** major  
  **Fix:** One restrained glyph max; no emoji fallbacks; text carries the job.

- **Tell:** Coach tip card misuses success tint  
  **Where:** `NutritionMacroExplainSheet.tsx` ~152 (`border-brand/40 bg-tint-success` + `text-brand`)  
  **Severity:** major  
  **Fix:** Use `bg-card border-border` (or brand wash token if added) — `tint-success` is for success confirmations, not insight callouts.

## Minor

- **Tell:** Sheet padding `px-5` on macro explain vs `px-6` on detail  
  **Where:** `NutritionMacroExplainSheet.tsx` ~71; detail sheet ~23 uses `px-6`  
  **Severity:** minor  
  **Fix:** Standardize sheet insets to `px-6`.

- **Tell:** Prefer `AnimatedPressable` for Close on detail sheet  
  **Where:** `NutritionDetailSheet.tsx` ~35–37  
  **Severity:** minor  
  **Fix:** Animated press (macro explain Close correctly uses shared `Button`).

## Notes

- Detail sheet is a thin shell — good IA (handle, title, Close, scroll body).
- Macro explain Close via `Button` secondary — correct.
- Spinner debt inside `NutritionSection` cold load is sibling of glance/settings; fix with section skeleton when redesigning nutrition.

**Counts:** 1 critical · 4 major · 2 minor
