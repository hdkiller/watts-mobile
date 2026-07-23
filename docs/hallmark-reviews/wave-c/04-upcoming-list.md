# Hallmark audit · Upcoming planned list
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `app/(app)/upcoming/index.tsx`

## Verdict
Clean schedule list: `ListSkeleton`, day sections with correct kicker type, bordered cards, honest empty. Gaps are stamp, error chrome, and row press/a11y discipline (sibling Recent list is further along with `AnimatedPressable`).

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `app/(app)/upcoming/index.tsx:1`  
   **Severity:** major  
   **Fix:** Stamp Workbench + `docs/DESIGN.md` (match events/goals list stamps).

2. **Tell:** design-system drift — error state  
   **Where:** `app/(app)/upcoming/index.tsx:97-105`  
   **Severity:** major  
   **Fix:** Tinted error card (`border-danger/40 bg-tint-error`); Retry as `text-sm font-semibold text-brand` + `hitSlop={8}` (copy “Try again” → “Retry” optional).

3. **Tell:** press / a11y drift on list rows  
   **Where:** `app/(app)/upcoming/index.tsx:47-63` (`PlannedRow`)  
   **Severity:** major  
   **Fix:** Use `AnimatedPressable`; add `accessibilityRole="button"`, `accessibilityLabel` (title + meta), and ensure ~44pt target (`hitSlop` if needed).

## Minor

1. **Tell:** row title weight drift  
   **Where:** `app/(app)/upcoming/index.tsx:55` (`font-semibold` vs DESIGN row title `font-medium`)  
   **Severity:** minor  
   **Fix:** Align with DESIGN row title (`text-base font-medium text-text-primary`) unless list stamp intentionally elevates titles.

2. **Tell:** `active:opacity-80` press feedback  
   **Where:** `app/(app)/upcoming/index.tsx:48`  
   **Severity:** minor  
   **Fix:** Drop once on `AnimatedPressable`.

## Notes (not findings)
- Empty copy matches DESIGN honesty (“No upcoming planned workouts…”).
- Section headers use `tracking-widest` — correct.
- Meta joined with ` · ` — correct.
- Compliance mark + `SportIcon` size 14 — companion list pattern.

## Count
**0 critical · 3 major · 2 minor**
