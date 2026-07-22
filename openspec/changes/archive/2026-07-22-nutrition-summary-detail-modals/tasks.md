## 1. Data model & mapping

- [x] 1.1 Add typed fueling-plan analysis subset (dailyTotals + windows fields needed for explain) to nutrition types
- [x] 1.2 Update `mapNutrition` / `pickTodayNutrition` to retain that plan subset on day totals (keep existing goal/fluid/fuelState behavior)
- [x] 1.3 Extend unit tests in `mapNutrition` for retained plan fields

## 2. Explain builders

- [x] 2.1 Implement pure `macroExplain` helpers (breakdown rows + coach tip) mirroring web `MacroExplainModal` for Calories / Carbs / Protein / Fat
- [x] 2.2 Add unit tests covering calories baseline + workout EST/ACTUAL + goal adjustment, and macro window/progress rows
- [x] 2.3 Wire optional nutrition-settings fetch only if Bearer `GET /api/profile/nutrition` is confirmed; otherwise document plan-only path in code comments

## 3. Analysis sheet UI

- [x] 3.1 Build `NutritionMacroExplainSheet` page sheet (header, target card + progress, calculation-logic list with badges, coach insight, Close)
- [x] 3.2 Make Log `NutritionSection` calorie/macro tiles pressable when explainable; open sheet with selected metric
- [x] 3.3 Ensure non-explainable tiles (no goal/plan) remain non-interactive; quick-log / hydration / photo / Open web unchanged

## 4. Optional Today parity

- [x] 4.1 If glance layout allows clear hit targets, wire Today `NutritionGlance` per-metric taps to the same sheet; otherwise leave card → Log navigation as-is and skip

## 5. Verification

- [x] 5.1 Run nutrition unit tests and fix regressions
- [x] 5.2 Manually verify on device/simulator: open calories and each macro from Log, dismiss sheet, confirm targets match summary tiles
