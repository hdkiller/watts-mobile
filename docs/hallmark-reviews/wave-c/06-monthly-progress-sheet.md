# Hallmark audit · Monthly progress sheet
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `src/features/stats/MonthlyProgressSheet.tsx`

## Verdict
Useful glance-to-depth sheet, but it reads analytics-adjacent (metric × sport × view chips + chart + delta). Token drift on delta colors, spinner load, and missing stamp/haptics keep it out of DESIGN compliance.

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `src/features/stats/MonthlyProgressSheet.tsx:1`  
   **Severity:** major  
   **Fix:** Stamp sheet + DESIGN.md allegiance.

2. **Tell:** design-system drift — raw delta palette  
   **Where:** `src/features/stats/MonthlyProgressSheet.tsx:58-63` (`text-emerald-400`, `text-amber-300`)  
   **Severity:** major  
   **Fix:** Positive → `text-success` / `text-green-400`; negative → `text-modify` (or danger if “down” is bad); flat → `text-text-muted`.

3. **Tell:** skeletons-not-spinners  
   **Where:** `src/features/stats/MonthlyProgressSheet.tsx:166-167`  
   **Severity:** major  
   **Fix:** Chart-height skeleton matching `LineSeriesChart` (200) instead of lone `ActivityIndicator`.

4. **Tell:** dashboard-adjacent companion surface  
   **Where:** `src/features/stats/MonthlyProgressSheet.tsx:85-201` (three chip rows + chart + multi-stat legend + “Open dashboard”)  
   **Severity:** major  
   **Fix:** Lead with one narrative delta + default metric; collapse Metric/Sport/View into progressive disclosure; keep web handoff but prefer “Open in Coach Watts” wording over “Open dashboard” if product allows.

5. **Tell:** haptic map gap (chip selection)  
   **Where:** `src/features/stats/MonthlyProgressSheet.tsx:91-161`  
   **Severity:** major  
   **Fix:** `hapticLight()` on metric/sport/view chip presses.

## Minor

1. **Tell:** layout padding drift  
   **Where:** `src/features/stats/MonthlyProgressSheet.tsx:73`, `85` (`px-5` vs screen `px-6`)  
   **Severity:** minor  
   **Fix:** Align sheet content to `px-6` unless sheet chrome standard is documented as `px-5`.

2. **Tell:** press feedback via `active:opacity-*`  
   **Where:** `src/features/stats/MonthlyProgressSheet.tsx:80`, `204`  
   **Severity:** minor  
   **Fix:** `AnimatedPressable` for Done / web handoff.

## Notes (not findings)
- Selected chips correctly use `bg-brand` + `text-ink` (contrast rule).
- Surfaces/borders are semantic.
- Error uses `text-red-400` only — upgrade with tinted card when touching the load path.

## Count
**0 critical · 5 major · 2 minor**
