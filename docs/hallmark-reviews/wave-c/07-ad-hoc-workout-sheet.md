# Hallmark audit · Create ad-hoc workout sheet
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `src/features/today/CreateAdHocWorkoutSheet.tsx`

## Verdict
Form sheet is mostly on-system (semantic inputs, `Button` primary/secondary, brand/ink chips). Missing stamp, haptics, and keyboard avoidance are the main DESIGN gaps.

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `src/features/today/CreateAdHocWorkoutSheet.tsx:1`  
   **Severity:** major  
   **Fix:** Stamp sheet + `docs/DESIGN.md`.

2. **Tell:** haptic map gap  
   **Where:** `src/features/today/CreateAdHocWorkoutSheet.tsx:49-62` (chips), `94-107` (validation fail)  
   **Severity:** major  
   **Fix:** `hapticLight()` on chip select; `hapticError()` when `validateAdHocForm` fails; success haptic belongs at the caller after API success.

3. **Tell:** keyboard & input accessibility  
   **Where:** `src/features/today/CreateAdHocWorkoutSheet.tsx:129-181` (duration + multiline notes in `ScrollView` only)  
   **Severity:** major  
   **Fix:** Wrap with `KeyboardAvoidingView` / keyboard-aware scroll for standalone sheet; dismiss-on-background tap per DESIGN Keyboard section.

## Minor

1. **Tell:** press feedback via `active:opacity-*`  
   **Where:** `src/features/today/CreateAdHocWorkoutSheet.tsx:124`  
   **Severity:** minor  
   **Fix:** `AnimatedPressable` for Cancel link.

2. **Tell:** copy voice (product jargon in title)  
   **Where:** `src/features/today/CreateAdHocWorkoutSheet.tsx:119` (“Generate Ad-Hoc Workout”)  
   **Severity:** minor  
   **Fix:** Athlete-facing title e.g. “Custom workout” / “Build today’s session” — keep “ad-hoc” out of the hero line if possible.

## Notes (not findings)
- Chip selected state `bg-brand` + `text-ink` — correct contrast.
- Footer actions correctly use shared `Button` (no one-off button styles).
- Placeholder colors via `useThemeColors().textMuted` — theme-safe.

## Count
**0 critical · 3 major · 2 minor**
