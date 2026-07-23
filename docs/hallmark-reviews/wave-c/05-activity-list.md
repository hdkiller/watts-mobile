# Hallmark audit · Recent activity list
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `app/(app)/activity/index.tsx`

## Verdict
Stronger list craft than Upcoming (`AnimatedPressable`, staggered enter). Token drift on status colors and missing stamp/error chrome are the blockers.

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `app/(app)/activity/index.tsx:1`  
   **Severity:** major  
   **Fix:** Stamp Workbench + `docs/DESIGN.md`.

2. **Tell:** design-system drift — raw status palette  
   **Where:** `app/(app)/activity/index.tsx:33-43` (`text-emerald-400`, `text-amber-300`)  
   **Severity:** major  
   **Fix:** Map ready → `text-success` / `text-green-400`; processing → `text-modify`; failed → `text-danger` / `text-red-400`; default → `text-text-muted`.

3. **Tell:** design-system drift — error state  
   **Where:** `app/(app)/activity/index.tsx:110-118`  
   **Severity:** major  
   **Fix:** Tinted error card + brand Retry (`font-semibold`), same as DESIGN States.

## Minor

1. **Tell:** row a11y labels  
   **Where:** `app/(app)/activity/index.tsx:64-88`  
   **Severity:** minor  
   **Fix:** Explicit `accessibilityLabel` including status (title · date · status) so VoiceOver doesn’t rely on visual status alone.

## Notes (not findings)
- `ListSkeleton` + honest empty — correct.
- Card chrome `rounded-xl border border-border bg-card/80` — matches DESIGN list rows.
- Enter animation capped to first 10 rows — restrained motion, OK for companion.

## Count
**0 critical · 3 major · 1 minor**
