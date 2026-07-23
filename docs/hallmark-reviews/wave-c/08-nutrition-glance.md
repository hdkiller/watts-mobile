# Hallmark audit · Nutrition glance
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `src/features/nutrition/NutritionGlance.tsx`

## Verdict
Strong Today teaser structure (section kicker, card, calories hero, next window). **Critical** raw hex improvisation for macro/hydration colors breaks the locked token system; stamp, skeleton, and press discipline follow.

## Critical

1. **Tell:** design-system drift — raw palette / mid-render improvisation  
   **Where:** `src/features/nutrition/NutritionGlance.tsx:177-191`, `198`, `208` (`#fbbf24`, `#60a5fa`, `#a78bfa`)  
   **Severity:** critical  
   **Fix:** Lift macro/hydration accents into theme tokens (or reuse existing brand/recovery/modify/zone tokens) in `colors.ts` + Tailwind; consume via `Colors.*` / semantic classes — never hard-coded hex in the glance.

## Major

1. **Tell:** missing system reference  
   **Where:** `src/features/nutrition/NutritionGlance.tsx:1`  
   **Severity:** major  
   **Fix:** Stamp glance + DESIGN.md (component-scope OK).

2. **Tell:** skeletons-not-spinners  
   **Where:** `src/features/nutrition/NutritionGlance.tsx:123-124`  
   **Severity:** major  
   **Fix:** Compact card skeleton (calorie line + 3 macro stubs) instead of `ActivityIndicator`.

3. **Tell:** press / hit target drift  
   **Where:** `src/features/nutrition/NutritionGlance.tsx:118-120` (“Log meal” lacks `hitSlop`), plus multiple `active:opacity-70` pressables `71`, `128`, `138`, `218`  
   **Severity:** major  
   **Fix:** `hitSlop={8}` on text links; prefer `AnimatedPressable` for tappable glance regions.

## Minor

1. **Tell:** emoji fallback as icon seasoning  
   **Where:** `src/features/nutrition/NutritionGlance.tsx:198` (`fallback="💧"`)  
   **Severity:** minor  
   **Fix:** Prefer a non-emoji text/MD fallback already mapped in `AppSymbol`, or omit glyph if MD pair exists.

2. **Tell:** glance density (macro dashboard)  
   **Where:** `src/features/nutrition/NutritionGlance.tsx:141-211`  
   **Severity:** minor  
   **Fix:** Keep calories + fuel state as the glance decision; macros can stay but avoid competing “hero” weight with Today’s training recommendation.

## Notes (not findings)
- Fuel chip uses `bg-tint-success` + `text-success` — correct.
- Calorie bar uses `Colors.brand` — correct.
- Empty state honest (“No meals logged yet today.”).
- `AppSymbol` for clock/chevron — good pattern for siblings to copy.

## Count
**1 critical · 3 major · 2 minor**
