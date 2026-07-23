# Hallmark audit · Analyze Readiness
- **Wave:** B
- **Pri:** P0
- **Route/file:** `src/features/today/AnalyzeReadinessPanel.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `AnalyzeReadinessPanel.tsx` L1  
  **Severity:** major  
  **Fix:** Stamp after redesign/polish.

- **Tell:** `design-system drift` (raw amber quota shell)  
  **Where:** `shellByState.quota` ~23 (`border-amber-900/40 bg-amber-950/25`)  
  **Severity:** major  
  **Fix:** Use semantic warning/modify shell shared with Today ad-hoc quota.

- **Tell:** Idle state competes as a second hero when stacked under Coach Check-In on Today  
  **Where:** idle block ~76–102; composed from `today/index.tsx` ~622–657  
  **Severity:** major  
  **Fix:** Treat Analyze as the sole primary decision when empty; demote Coach Check-In to a single text link under CTAs.

## Minor

- **Tell:** In-place `ActivityIndicator` while generating (allowed by DESIGN for section waits; still noisier than a compact skeleton block)  
  **Where:** ~38–45  
  **Severity:** minor  
  **Fix:** Optional: replace with a short skeleton matching the idle layout; keep button `loading` for the trigger path.

- **Tell:** Prefer `AnimatedPressable` for ad-hoc text link  
  **Where:** ~88–99  
  **Severity:** minor  
  **Fix:** Use `AnimatedPressable` (hitSlop already present).

- **Tell:** Error kicker uses `text-red-400/90` / body `text-red-300`  
  **Where:** ~64–67  
  **Severity:** minor  
  **Fix:** Standardize on DESIGN error card text (`text-red-400`).

## Notes

- Idle copy is honest and CTA uses shared `Button` with loading — good field-companion pattern.
- Quota / error footers correctly route to web via `Button`.

**Counts:** 0 critical · 3 major · 3 minor
