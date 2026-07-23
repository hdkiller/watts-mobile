# Hallmark stamped regression · 2026-07-24

Read-only pass on already-stamped surfaces. Locked system: [`docs/DESIGN.md`](../../DESIGN.md). Special checks: stamp lies · design-system drift · Workbench sameness (Goals / Events / Athlete).

## Counts

| Review | Surfaces | Critical | Major | Minor |
|--------|----------|----------|-------|-------|
| [goals-hub.md](./goals-hub.md) | goals list · detail · create · GoalsLiteSection | 0 | 0 | 2 |
| [events-hub.md](./events-hub.md) | events list · detail · create | 0 | 0 | 2 |
| [athlete-profile.md](./athlete-profile.md) | athlete route · overview · report sheet | 0 | 0 | 0 |
| [photo-meal-flow.md](./photo-meal-flow.md) | PhotoMealFlowScreen → LogMealSheet screen | 0 | 1 | 2 |
| **Total** | | **0** | **1** | **6** |

## Verdict

Stamps hold across the Workbench hubs and Narrative Workflow photo meal path. No stamp lies. Goals / Events / Athlete share the Workbench family (catalog-expected) but keep distinct fingerprints (type-code · date-tile · profile bench) — **no variety-drift flag**. Only material regression: raw macro/confidence chroma in `LogMealSheet` (photo meal path).

## Priority if polishing

1. Tokenize C/P/F + estimate confidence colors in `LogMealSheet` (photo-meal major).
2. Align Goals/Events list-detail error cards with Athlete / GoalsLiteSection tinted pattern (shared minor).
3. `AnimatedPressable` + hitSlop on create chips / meal chrome (minor).
