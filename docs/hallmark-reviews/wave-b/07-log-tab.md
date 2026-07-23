# Hallmark audit · Log tab
- **Wave:** B
- **Pri:** P0
- **Route/file:** `app/(app)/(tabs)/log/index.tsx` (+ sheet hosts; NutritionSection not primary — nutrition is summary card + sheets)
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

- **Tell:** `first-viewport decision overload` / dashboard clone  
  **Where:** `log/index.tsx` ~225–360 (status banner → Quick Actions 2×N icon grid → entries → Nutrition & Metrics Summary)  
  **Severity:** critical  
  **Fix:** First viewport = status + one primary write (Wellness or next incomplete action); demote the five-tile grid to a compact list or overflow sheet.

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `log/index.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp after redesign.

- **Tell:** `decorative icon noise` / emoji-as-icon clusters  
  **Where:** Quick Actions ~279–353 (`fallback` 🍽️💧🩹📏💬 in circular icon wells)  
  **Severity:** major  
  **Fix:** Text-first rows with optional single `AppSymbol`; drop emoji fallbacks from the grid.

- **Tell:** Quick-action tiles are card chrome for every action (card fatigue)  
  **Where:** ~267–360  
  **Severity:** major  
  **Fix:** Hairline list rows or one primary `Button` + secondary text links per DESIGN list patterns.

## Minor

- **Tell:** Prefer `AnimatedPressable` over `Pressable` + `active:opacity-80`  
  **Where:** status Update ~247; quick actions ~269–359; entry actions ~392; summary cards ~407–477  
  **Severity:** minor  
  **Fix:** Use `AnimatedPressable`.

- **Tell:** Title uses `font-bold` vs screen title `font-semibold`  
  **Where:** ~227  
  **Severity:** minor  
  **Fix:** `text-2xl font-semibold text-text-primary`.

- **Tell:** Measurement chips inside summary card approach card-in-card  
  **Where:** ~462–471 (`rounded-lg bg-surface` tiles inside card)  
  **Severity:** minor  
  **Fix:** Plain metadata lines joined with `' · '`.

- **Tell:** No skeleton while `wellnessLoading` — banner may flash pending→done  
  **Where:** query ~49; banner ~232–261  
  **Severity:** minor  
  **Fix:** Brief banner/row skeleton until wellness settles.

## Notes

- Empty entries copy is honest and actionable.
- Status Update / Check in link has `hitSlop={8}` and brand text — good.
- Sheet hosting (meal, hydration, wellness, measurement) is structurally fine; density issue is the hub itself.

**Counts:** 1 critical · 3 major · 4 minor
