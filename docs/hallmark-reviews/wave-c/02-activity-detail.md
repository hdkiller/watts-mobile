# Hallmark audit · Activity detail
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `app/(app)/activity/[id].tsx` (charts/map are separate Wave C files)

## Verdict
Well-structured session truth screen: skeleton, semantic tokens, analysis waiting skeletons, haptics on analysis phase change, shared `Button`/`SportIcon`. Main gaps are stamp, error chrome, and opacity-only pressables on disclosure links.

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `app/(app)/activity/[id].tsx:1`  
   **Severity:** major  
   **Fix:** Stamp allegiance to `docs/DESIGN.md` (Workbench or Narrative Workflow — analysis CTA as the decision beat).

2. **Tell:** design-system drift — error state  
   **Where:** `app/(app)/activity/[id].tsx:336-340`  
   **Severity:** major  
   **Fix:** Tinted error card + brand Retry; avoid bare `text-red-400` on `bg-surface`.

3. **Tell:** press primitive drift  
   **Where:** `app/(app)/activity/[id].tsx:151-161`, `242-250`, `261-270`  
   **Severity:** major  
   **Fix:** Prefer `AnimatedPressable` for Full analysis / View plan / Import notes toggles; keep `hitSlop={8}` (already present on most).

## Minor

1. **Tell:** density / first-viewport decision blur  
   **Where:** `app/(app)/activity/[id].tsx:347-407` (hero → metrics grid → adherence → exercises → analysis → map → charts before primary CTAs)  
   **Severity:** minor  
   **Fix:** Keep depth, but ensure first viewport answers “how did this go?” (status + 1–3 hero stats + analysis glance) before metric grids; defer map/charts below the fold without reordering product requirements if already intentional.

2. **Tell:** bullet glyph improvisation  
   **Where:** `app/(app)/activity/[id].tsx:172`, `197`, `208` (`• ` prefixes)  
   **Severity:** minor  
   **Fix:** Hairline-divided rows or `AppSymbol` list markers for consistency with other detail lists.

## Notes (not findings)
- Analysis-in-progress uses layout skeletons — matches DESIGN over a full-screen spinner.
- `hapticSuccess` / `hapticError` on analysis phase transition — correct map usage.
- `ScoreCell` uses semantic text tokens — OK (ScoreChip pills live in shared component).
- Web handoff via secondary `Button` — correct companion pattern.

## Count
**0 critical · 3 major · 2 minor**
