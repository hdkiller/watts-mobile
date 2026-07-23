# Hallmark audit · Planned workout detail
- **Wave:** C
- **Date:** 2026-07-24
- **Design system:** docs/DESIGN.md
- **Stamp:** missing
- **Surface:** `app/(app)/planned/[id].tsx` (+ `StructureProfile` for zone silhouette)

## Verdict
Solid field-companion detail: skeleton, semantic surfaces, `Button` / `SportIcon`, zone ramp via tokens. Gaps are system stamp, error chrome, press/haptic discipline, and a few raw `Pressable` patterns.

## Critical
_None._

## Major

1. **Tell:** missing system reference  
   **Where:** `app/(app)/planned/[id].tsx:1` (file head — no Hallmark comment)  
   **Severity:** major  
   **Fix:** Add stamp `/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: docs/DESIGN.md · designed-as-app */` (or Narrative Workflow if redesign prioritizes Complete/Skip as the chapter).

2. **Tell:** design-system drift — error state  
   **Where:** `app/(app)/planned/[id].tsx:120-125`  
   **Severity:** major  
   **Fix:** Use tinted error card (`border-danger/40 bg-tint-error`) + brand Retry `Pressable` with `hitSlop={8}`; keep `text-red-400` for message.

3. **Tell:** haptic map gap (successful API actions)  
   **Where:** `app/(app)/planned/[id].tsx:84-112` (`onComplete` / `onSkip` mutate paths)  
   **Severity:** major  
   **Fix:** Call `hapticSuccess()` on successful complete/skip; `hapticError()` when `actionError` is set.

4. **Tell:** press primitive drift  
   **Where:** `app/(app)/planned/[id].tsx:165-178` (linked completed activity card)  
   **Severity:** major  
   **Fix:** Prefer `AnimatedPressable`; add `hitSlop={8}` (or ensure card height ≥44pt) and keep role/label.

## Minor

1. **Tell:** press feedback via `active:opacity-*`  
   **Where:** `app/(app)/planned/[id].tsx:168`, `266`  
   **Severity:** minor  
   **Fix:** Route through `AnimatedPressable` spring-scale instead of opacity-only classes.

2. **Tell:** type-scale drift (section kicker)  
   **Where:** `app/(app)/planned/[id].tsx:183`, `190`, `213`, `269`, `277` (`tracking-wide` without `font-semibold` / `tracking-widest`)  
   **Severity:** minor  
   **Fix:** Match DESIGN section header: `text-xs font-semibold uppercase tracking-widest text-text-muted` (or keep card-label `tracking-wide` consistently).

3. **Tell:** empty/error honesty polish  
   **Where:** `app/(app)/planned/[id].tsx:162` (inline `actionError` as bare red text)  
   **Severity:** minor  
   **Fix:** Keep near CTAs but use the same tinted error chip pattern as screen-level errors.

## Notes (not findings)
- Loading uses `DetailSkeleton` — correct.
- Zone fills use `zoneColor` / `Colors.zoneNeutral` — token-correct.
- Primary actions use shared `Button` — correct.
- Structure list + silhouette is companion-appropriate (not a dashboard clone).

## Count
**0 critical · 4 major · 3 minor**
