## Why

On Plan → Nutrition an athlete can accept or reject the draft, and nothing else. `PlanNutritionSegment` offers Done / Skip / Unlock per meal — there is no way to say "not that, this instead". Web has had meal choice since `MealRecommendationModal.vue`: fetch AI options for a fueling window via `POST /api/nutrition/recommendations/meal`, then lock the pick with `POST /api/nutrition/plan/meal`.

The mobile client is already half-built for this and stalled: `lockNutritionPlanMeal()` exists in `src/features/nutrition/api.ts` with **no caller anywhere in the app**, and `patchNutritionPlanMeal`'s action type omits `replace` even though the server accepts `complete | skip | unlock | replace`. The `nutrition-plan-on-plan-tab` change specified both (§2.3, "meal done/skip/unlock/replace (+ recommendation pick)") and marked the task complete, but the recommendation pick and the window-level view were never delivered. This change finishes that work honestly rather than re-marking it done.

The day view is also flatter than the plan data it renders: the API returns fueling **windows** with per-window macro targets, and mobile collapses them into an undifferentiated meal list, so the athlete cannot see what a window is asking for before deciding.

## What Changes

- Add `replace` to the plan-meal action type and wire it through `patchNutritionPlanMeal`.
- Add `fetchMealRecommendations` (`POST /api/nutrition/recommendations/meal`) returning meal options for a date + window.
- Wire the already-present `lockNutritionPlanMeal` to a meal-picker sheet: open from a window, browse options, lock the choice.
- Restructure the day sheet around fueling windows — each window shows its type, scheduled time, and macro targets, with its meal (or an empty slot) beneath it.
- Allow locking a meal into an **empty** window, not only replacing an existing one.
- Keep Done / Skip / Unlock exactly as they are.

## Capabilities

### Modified Capabilities

- `nutrition-plan`: Day view becomes window-structured; meal replace and recommendation-pick become real rather than specified-only.

## Impact

- **Mobile:** `src/features/nutrition/api.ts` (recommendations fetch; `replace` action), `useNutrition.ts` (lock + recommendations hooks — `lockNutritionPlanMeal` gains its first caller), `src/features/plans/PlanNutritionSegment.tsx` (window-structured day sheet), new meal-picker sheet, `mapNutritionPlan.ts` (expose windows, not just meals).
- **coach-wattz:** Confirm Bearer + `nutrition:write` on `POST /api/nutrition/recommendations/meal` and `POST /api/nutrition/plan/meal`. Recommendation generation is AI-backed and may be slow or quota-limited — confirm the quota error shape so mobile can surface it honestly rather than as a generic failure.
- **Sequencing:** After `nutrition-log-item-edit` (shared query keys, and correction outranks choice). Independent of the training-plan changes.
- **Debt:** Supersedes the unmet portion of `nutrition-plan-on-plan-tab` §2.3. That change's tasks should not be treated as evidence this shipped.
