# Hallmark audit · Today home
- **Wave:** B
- **Pri:** P0
- **Route/file:** `app/(app)/(tabs)/today/index.tsx` + `src/features/today/*` (hero, AnalyzeReadinessPanel, WellnessSection, NutritionGlance, TrainingLoadGlance, WeekGlanceStrip, teasers)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

- **Tell:** `first-viewport decision overload` / dashboard clone  
  **Where:** `app/(app)/(tabs)/today/index.tsx` ~552–914 (greeting → FinishSetup → AnalysisReady → Coach Check-In → Analyze/hero → CTAs → NutritionGlance → Wellness → TrainingLoad → MonthlyProgress → Week strip → Events → Coming up → Recently)  
  **Severity:** critical  
  **Fix:** Keep first viewport to greeting + one decision block (hero / Analyze / Finish-setup); push glances below a single “More today” fold or secondary scroll region.

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `app/(app)/(tabs)/today/index.tsx` L1  
  **Severity:** major  
  **Fix:** After redesign, stamp `/* Hallmark · genre: modern-minimal · … · design-system: docs/DESIGN.md · designed-as-app */`.

- **Tell:** `hit target undersized` (camera affordance 40×40, no `hitSlop`)  
  **Where:** `app/(app)/(tabs)/today/index.tsx` ~582–594  
  **Severity:** major  
  **Fix:** Use `h-11 w-11` and/or `hitSlop={8}`; prefer `AnimatedPressable`.

- **Tell:** `design-system drift` (raw amber quota shell)  
  **Where:** `app/(app)/(tabs)/today/index.tsx` ~668–681 (`border-amber-900/40 bg-amber-950/25`)  
  **Severity:** major  
  **Fix:** Map quota/plan-limit to semantic tint tokens (or shared modify/warning shell), not raw amber zinc-family hexs.

- **Tell:** `decorative icon noise` / emoji-as-icon (camera fallback + wellness emoji fallbacks + recovery pill row)  
  **Where:** Today camera `fallback="📷"` ~593; `src/features/today/wellness-section.tsx` ~191–261 (🌙💓❤️ + chip row)  
  **Severity:** major  
  **Fix:** Rely on `AppSymbol` without emoji clusters; keep recovery as text rows or one “+ Log event” link, not a pill strip.

- **Tell:** `pill cluster clutter` (active recovery chips)  
  **Where:** `src/features/today/wellness-section.tsx` ~239–263  
  **Severity:** major  
  **Fix:** Collapse to a single recovery line + one CTA; open sheet/list for multiples.

## Minor

- **Tell:** Prefer `AnimatedPressable` over raw `Pressable` + opacity  
  **Where:** camera ~582; Coach Check-In ~624; Retry ~614; Accepted CTA ~748  
  **Severity:** minor  
  **Fix:** Swap to `AnimatedPressable` with `hitSlop={8}` where missing.

- **Tell:** `design-system drift` (error copy `text-red-300` vs system `text-red-400`)  
  **Where:** `today/index.tsx` ~611, ~687  
  **Severity:** minor  
  **Fix:** Use `text-red-400` / DESIGN error card pattern consistently.

- **Tell:** Decorative success glyph (`✓` text) instead of `AppSymbol`  
  **Where:** `today/index.tsx` ~754–763  
  **Severity:** minor  
  **Fix:** Use `AppSymbol` checkmark with `text-green-400` / success token.

- **Tell:** Nutrition glance “Log meal” link missing `hitSlop`  
  **Where:** `src/features/nutrition/NutritionGlance.tsx` ~118–120  
  **Severity:** minor  
  **Fix:** Add `hitSlop={8}` on the Pressable.

## Notes

- Initial load correctly uses layout-matching `SkeletonScreen` (~468–490) — not a spinner violation.
- Recommendation hero tones (`brand` / `recovery` / `modify`) and `Button` CTAs follow DESIGN when the hero is the sole focus.
- Week strip (`week-glance-strip.tsx`) is restrained text + bars; density problem is compositional stacking on Today, not the strip alone.

**Counts:** 1 critical · 5 major · 4 minor
