## 1. API + state

- [x] 1.1 Confirm Bearer + `nutrition:write` on `POST /api/nutrition/recommendations/meal` and `POST /api/nutrition/plan/meal`; capture the quota error shape
- [x] 1.2 Add `replace` to the plan-meal action type and thread it through `patchNutritionPlanMeal`
- [x] 1.3 Add `fetchMealRecommendations` to `src/features/nutrition/api.ts`
- [x] 1.4 Add recommendation + lock hooks in `useNutrition.ts`; give `lockNutritionPlanMeal` its first caller
- [x] 1.5 Restructure `mapNutritionPlanDays` to return windows with an optional meal; preserve `weekHasSelectedMeals` semantics
- [x] 1.6 Update mapper tests for the window shape and the derived day counts

## 2. Day sheet + picker UI

- [x] 2.1 Rebuild the day sheet around windows: type, time, targets, meal or empty slot
- [x] 2.2 Meal picker sheet: option cards with title and macro totals, confirm to lock
- [x] 2.3 Route to lock vs replace based on whether the window already holds a meal
- [x] 2.4 Pending state with prolonged-wait hint; quota-specific copy distinct from generic failure
- [x] 2.5 Keep complete / skip / unlock working when recommendations are unavailable
- [x] 2.6 Update the empty-week hint consumer in `PlanTrainingSegment` for the new mapper shape

## 3. Integration + QA

- [ ] 3.1 Verify grocery list picks up a newly locked meal, or document that a regenerate is required
  <!-- Deferred: grocery uses locked meal ingredients; if a lock does not refresh grocery, regenerate grocery/plan on web. Re-verify after end-to-end retest. -->
- [x] 3.2 testIDs for window rows, empty slots, picker, and lock confirm
- [ ] 3.3 Manual: empty window → pick → locked; filled window → replace; force a quota failure and confirm honest copy
  <!-- Deferred by request — retest after all four changes land. Requires coach-wattz Bearer fixes for recommendations + runs deployed. -->
