## Why

Fueling (Eco / Steady / Performance) is part of the same daily decision as training and recovery, but on Today the full Nutrition glance currently sits *above* the recommendation hero — crowding the first viewport — while the decision surface itself never names today’s fuel state. Athletes should see fueling belong to the morning call without Today becoming a nutrition dashboard.

## What Changes

- Add a compact **fuel-state decision link** in the Today decision composition (near the recommendation / planned hero, not a macro wall): show Eco / Steady / Performance (or current fuel-state vocab) when nutrition tracking is enabled and fuel state is known; honest quiet omit/unavailable when not.
- **Move** the full `NutritionGlance` (calories / macros / next window) **below** primary decision CTAs so glances stay secondary to Accept / Rest / planned actions.
- Tap targets: fuel-state chip/link opens Log nutrition (or the shared macro-explain sheet when already available from `nutrition-summary-detail-modals`) — no second nutrition design system on Today.
- Explicit overlap callout: finish/archive `nutrition-summary-detail-modals` before or alongside this change so Today taps reuse the same explain sheet; do not duplicate modal work.
- Non-goals: grocery, meal plans, nutrition settings overhaul, editing fueling strategy on Today, first-viewport calorie/macro dashboard.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `today-home`: Decision composition SHALL include an optional compact fuel-state affordance when tracking is on; full nutrition glance MUST appear below primary CTAs (not above the hero).
- `nutrition-quick-log` (light): Clarify Today’s relationship — decision-link + post-CTA glance reuse Log nutrition data/actions; writes stay Log-first.

## Impact

- **Mobile UI**: `app/(app)/(tabs)/today/index.tsx` order; new compact fuel-state row/chip (likely under `src/features/nutrition/` or today); `NutritionGlance` placement.
- **Data**: Existing `GET /api/nutrition` / `useTodayNutritionQuery` / `fuelStateLabel` — no new endpoints.
- **Overlap**: `nutrition-summary-detail-modals` (active, nearly complete) owns explain sheets; this change consumes them if wired to Today. `recommendation-why-transparency` MAY show fuel state quietly inside View Details — keep copy/placement consistent, not duplicated chrome.
- **coach-wattz**: None required (fuel state already on nutrition day / fueling plan).
