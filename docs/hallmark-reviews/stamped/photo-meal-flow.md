# Hallmark audit · Photo meal flow (regression)

- **Wave:** stamped / regression
- **Surfaces:** `src/features/nutrition/PhotoMealFlowScreen.tsx` (entry) → `LogMealSheet` `presentation="screen"` (implementation)
- **Date:** 2026-07-24
- **Genre:** modern-minimal (stamp)
- **Macrostructure:** Narrative Workflow · `designed-as-app`
- **Design system:** docs/DESIGN.md
- **Stamp:** on `PhotoMealFlowScreen.tsx` only (shell)

## Summary

Stamp holds for the delivered path: compose → analyzing → review → logged is a real staged workflow (“Capture, review, then save”). Not a stamp lie — the thin screen correctly owns the Narrative Workflow entry while UI lives in `LogMealSheet`. Success state respects DESIGN (ink on brand, no confetti). Main regression gap is raw Tailwind chroma for macros/confidence inside the shared sheet.

## Critical

_None._ (Narrative Workflow claim matches the staged photo path.)

## Major

- **Tell** — `design-system drift` (raw chromatic palette)
  - **Where** — `src/features/nutrition/LogMealSheet.tsx` `MacroRatioBar` ~L95–117 (`bg-amber-500` / `bg-emerald-500` / `bg-rose-500`); review confidence borders/text ~L1007–1029 (`border-emerald-500`, `border-amber-500`, `border-rose-500`, `text-amber-500`, `text-rose-500`)
  - **Severity** — major
  - **Fix** — Map C/P/F + confidence to named semantic tokens (or a small nutrition/confidence ramp in `colors.ts` / Tailwind theme) — never raw amber/emerald/rose in components.

## Minor

- **Tell** — `design-system drift` (error chrome)
  - **Where** — `LogMealSheet.tsx` screen compose/review errors ~L1040, L1076 (bare `text-red-400`)
  - **Severity** — minor
  - **Fix** — Tinted error card per DESIGN States when the flow is blocked.

- **Tell** — `design-system drift` (press primitive)
  - **Where** — `LogMealSheet.tsx` header Cancel/Done ~L911–925; Clear estimate ~L1056–1062 (`Pressable` + `active:opacity-*`)
  - **Severity** — minor
  - **Fix** — Prefer `AnimatedPressable` + brand weight for Done; keep Cancel muted.

## Stamp / family notes

| Claim | Verdict |
|-------|---------|
| Narrative Workflow | Holds via mode stages (not marketing 1.0/2.0 labels — app-adapted) |
| Shell vs implementation | Stamp on shell is OK; drift lives in unstamped `LogMealSheet` |
| Completion | Restrained checkmark + real totals — matches DESIGN Success |

## Count

0 critical · 1 major · 2 minor

## What works

Dedicated screen compose empty state; analyzing card with photo; editable review before save; `Button` primary/secondary; ink-on-brand success mark; hapticSuccess; semantic surface/card/text elsewhere in the flow chrome.
