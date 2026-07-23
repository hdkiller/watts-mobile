# Hallmark audit · Activity charts
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `src/features/activity/ActivityCharts.tsx` (+ color origin in `mapCharts.ts`; bar/line children otherwise token-correct)

## Verdict
Charts compose cleanly with zone ramp + brand deep accents. Main issues: no Hallmark stamp, section loading uses a spinner instead of a chart-shaped skeleton, and HR series color bypasses the semantic `recovery` token.

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `src/features/activity/ActivityCharts.tsx:1`  
   **Severity:** major  
   **Fix:** Add DESIGN.md stamp on the charts feature entry (component-scope stamp is fine).

2. **Tell:** design-system drift — non-semantic color  
   **Where:** `src/features/activity/mapCharts.ts:110-117` (`'#38bdf8'` for heart-rate series)  
   **Severity:** major  
   **Fix:** Use `Colors.recovery` (same hex, semantic). Keep power on `Colors.brand` / curve accent `Colors.brandDeep`.

3. **Tell:** skeletons-not-spinners (section load)  
   **Where:** `src/features/activity/ActivityCharts.tsx:34-40`  
   **Severity:** major  
   **Fix:** Replace centered `ActivityIndicator` with a short chart-block skeleton (e.g. 160h bar + legend lines) so outdoor theme contrast and layout stability match the rest of detail.

## Minor

1. **Tell:** empty/error copy hierarchy  
   **Where:** `src/features/activity/ActivityCharts.tsx:43-51`  
   **Severity:** minor  
   **Fix:** Optional brand Retry when both queries fail (streams + curve); keep honest “unavailable” copy.

## Notes (not findings)
- `BarSeriesChart` zone fills via `zoneColor` — correct.
- Power curve accent `Colors.brandDeep` — correct per DESIGN chart accent.
- `LineSeriesChart` grid/strokes via `useThemeColors()` — theme-safe.
- Inline section waits are allowed by DESIGN; still prefer skeleton for chart chrome height.

## Count
**0 critical · 3 major · 1 minor**
