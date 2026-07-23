# Hallmark audit · Wellness overview sheet
- **Wave:** B
- **Pri:** P1
- **Route/file:** `src/features/wellness/WellnessOverviewSheet.tsx`
- **Date:** 2026-07-24
- **Genre assumed:** modern-minimal
- **Design system:** docs/DESIGN.md
- **Stamp:** none

## Critical

_(none)_

## Major

- **Tell:** `missing system reference` (no Hallmark stamp)  
  **Where:** `WellnessOverviewSheet.tsx` L1  
  **Severity:** major  
  **Fix:** Add Hallmark stamp after pass.

- **Tell:** `spinner instead of skeleton` (full-sheet centered spinner)  
  **Where:** ~141–144  
  **Severity:** major  
  **Fix:** Use metric-tile / trend-bar skeletons matching loaded layout.

- **Tell:** Hand-rolled primary/secondary actions bypass shared `Button`  
  **Where:** empty Check in ~160–165; Retry ~150–155; loaded CTAs ~201–212  
  **Severity:** major  
  **Fix:** Use `Button` / `Button variant="secondary"` only.

- **Tell:** Error state not DESIGN error card (`border-danger/40 bg-tint-error` + brand Retry link)  
  **Where:** ~145–156  
  **Severity:** major  
  **Fix:** Wrap in tinted error card; Retry as `text-sm font-semibold text-brand` with `hitSlop={8}`.

## Minor

- **Tell:** Prefer `AnimatedPressable` (Done / Retry / CTAs)  
  **Where:** ~136–138, ~150–155, ~201–212  
  **Severity:** minor  
  **Fix:** Animated press + ensure hitSlop on all text links.

- **Tell:** Trend / stale accents use raw `text-emerald-400` / `text-red-400` / `text-amber-400`  
  **Where:** `TrendText` ~43; stale ~131  
  **Severity:** minor  
  **Fix:** Prefer `text-success` / `text-danger` / `text-modify` semantic accents.

- **Tell:** Type weight `font-black` / `font-bold` diverges from scale (`font-semibold`)  
  **Where:** `MetricTile` ~53–57  
  **Severity:** minor  
  **Fix:** Align with DESIGN type scale.

- **Tell:** 2×N metric tile grid reads as mini-dashboard (acceptable in detail sheet; still dense)  
  **Where:** ~173–177  
  **Severity:** minor  
  **Fix:** Lead with 1–2 decision metrics + coach note; demote the rest.

## Notes

- Empty copy + Check in path is honest.
- Done link already has `hitSlop={8}`.
- Brand CTA correctly uses `text-ink` on `bg-brand` (contrast rule OK).

**Counts:** 0 critical · 4 major · 4 minor
