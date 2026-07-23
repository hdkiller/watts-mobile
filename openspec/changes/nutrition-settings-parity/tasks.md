## 1. Docs & coach-wattz Bearer

- [x] 1.1 Update product-baseline, open-questions, implementation-plan, AGENTS.md; mirror coach-wattz mobile-companion-app.md
- [x] 1.2 Switch `GET/POST /api/profile/nutrition` to `requireAuth` with `nutrition:read` / `nutrition:write`

## 2. Mobile API & shell

- [x] 2.1 Add nutrition settings types + `fetchNutritionSettings` / `saveNutritionSettings` API client
- [x] 2.2 Add TanStack Query hooks with invalidation of nutrition, athlete profile, and today
- [x] 2.3 Add Settings hub Nutrition row + `settings/nutrition` route shell

## 3. Settings form (web parity)

- [x] 3.1 Tracking toggle + Metabolic section (BMR, activity, base mode, goal profile, adjustment, floor)
- [x] 3.2 Meal schedule + dietary constraints multi-selects
- [x] 3.3 Fuel calibration + Adaptive engine sections (decorative Pro badges)
- [x] 3.4 Hydration section (sweat, sodium, three quick-add volumes) + Save CTA

## 4. Downstream + tests

- [x] 4.1 Wire HydrationQuickAddSheet presets from `quickAddVolumes`
- [x] 4.2 Wire macroExplain / explain sheet to fetch nutrition settings
- [x] 4.3 Unit tests for settings mapper and hydration preset resolution
- [ ] 4.4 Manual QA: save settings → Log/Today goals refresh; tracking off hides Log nutrition
