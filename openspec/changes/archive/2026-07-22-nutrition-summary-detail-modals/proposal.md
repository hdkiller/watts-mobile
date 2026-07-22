## Why

Athletes see today’s calorie and macro totals on Log (and a glance on Today) but cannot inspect how those daily targets were calculated. The web app already exposes a tap-to-explain modal (`MacroExplainModal` — “Calories Analysis”, “Carbs Analysis”, etc.) with calculation logic and coach insight; mobile should match that transparency so athletes trust dynamic fueling targets without opening the web escape.

## What Changes

- Make Log nutrition daily-summary tiles (calories, carbs, protein, fat) tappable when a daily target/fueling plan is available.
- Show a page-sheet analysis modal modeled on the web `MacroExplainModal`: header with actual intake, total daily target + progress, calculation-logic rows, coach insight, and Close.
- Retain and use `fuelingPlan` (and supporting athlete/settings inputs as needed) so calorie rows can show baseline, per-workout energy (ACTUAL/EST), and goal adjustment; macro rows can show baseline g/kg, window allocations, energy contribution, and progress.
- Optionally mirror the same tap affordance on Today’s nutrition glance for consistency (same modal, not a second design).
- Out of scope: hydration explain modal, nutrition settings editing, meal-plan generation, grocery, or porting the full nutrition detail page.

## Capabilities

### New Capabilities
- `nutrition-summary-detail-modals`: Tap calorie/macro summary values on the nutrition surface to open a breakdown sheet explaining how the daily target was calculated, aligned with the web analysis modal.

### Modified Capabilities
- `nutrition-quick-log`: Daily summary totals become interactive entry points into target analysis (in addition to displaying totals and quick-log actions).

## Impact

- **Mobile UI**: `NutritionSection` (Log), possibly `NutritionGlance` (Today); new sheet component(s) under `src/features/nutrition/`.
- **Data mapping**: `mapNutrition` / `NutritionDayTotals` currently drop `fuelingPlan` after reading fluid/fuelState — must retain plan breakdown fields needed for analysis.
- **APIs (coach-wattz)**: Continues to use `GET /api/nutrition` (`fuelingPlan.dailyTotals`, `windows`, workout calories). Full calorie/macro parity with web may also need nutrition settings (`GET /api/profile/nutrition` if Bearer-capable) and athlete weight (existing profile). No new write endpoints.
- **Patterns**: Reuse existing page-sheet modal patterns (`presentationStyle="pageSheet"`) used by stats/performance/wellness sheets.
- **Non-goals**: No web nutrition planning surfaces; no fifth tab.
