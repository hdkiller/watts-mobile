# Hallmark audit · Athlete activity glance

- **Wave:** stamped / feature add-on
- **Surfaces:** `src/features/profile/ActivityGlanceStrip.tsx`, `activityGlance.ts`, wired via `AthleteProfileOverview.tsx` / `app/(app)/athlete.tsx`
- **Date:** 2026-07-24
- **Genre:** modern-minimal (stamp)
- **Macrostructure:** Workbench (strip inside Athlete workbench)
- **Design system:** docs/DESIGN.md
- **Stamp:** present on glance + parent Athlete surfaces

## Summary

Compact rolling 12-week done/planned day circles fit Athlete Workbench without becoming a Today heatmap or year contribution graph. Semantic tokens, skeleton load, inline error+retry, and honest count header hold. Main debt is undersized day hit targets and a slightly GitHub-echo month-initial footer.

## Critical

_None._

## Major

1. **Tell:** press / hit target drift  
   **Where:** `ActivityGlanceStrip.tsx` day `AnimatedPressable` (`h-3 w-3`, `hitSlop={4}`)  
   **Severity:** major  
   **Fix:** Expand touch target toward ~44pt via larger pressable frame + `hitSlop={8}` (grid may still be dense; column/day overlap OK).

2. **Tell:** glance density / specimen echo  
   **Where:** month single-letter footer under week columns (`text-[9px]`)  
   **Severity:** major  
   **Fix:** Drop letter footer or replace with a single quiet range caption (`May–Aug`) so the strip doesn’t read as a contribution-graph clone.

## Minor

1. **Tell:** empty-state honesty  
   **Where:** success path with `0 done · 0 planned`  
   **Severity:** minor  
   **Fix:** Add one muted line (“No sessions in this window”) under the counts when both are zero.

2. **Tell:** type scale freestyle  
   **Where:** `text-[9px]` month marks  
   **Severity:** minor  
   **Fix:** Prefer existing metadata scale (`text-[10px]` / `text-xs`) or remove with major #2.

## Notes (not findings)

- Stamp + `docs/DESIGN.md` allegiance OK; Workbench claim holds as Athlete child.
- Loading uses `Skeleton`, not full-screen spinner.
- Errors use tinted danger card + Retry — matches Athlete overview.
- Colors: `brand` / `border` / `border-strong` only — no orange heatmap chrome.
- Parent Athlete stamps unchanged; glance failure does not block identity/AI.

## Count

**0 critical · 2 major · 2 minor** (pre-patch)

## Patch log (2026-07-24)

| Finding | Resolution |
|---------|------------|
| Major · hit targets | Day pressables `h-5` + full column width (max 22) + `hitSlop={8}` |
| Major · month-letter footer | Removed; range caption inline with counts (`May–Aug`) |
| Minor · empty window | “No sessions in this window.” when both counts are zero |
| Minor · `text-[9px]` | Removed with letter footer |

**Post-patch:** 0 critical · 0 major · 0 minor open.
