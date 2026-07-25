## 1. API + state

- [x] 1.1 Confirm Bearer nutrition plan / generate / meal / grocery contracts + scopes
- [x] 1.2 Add `src/features/nutrition` plan fetch/mutations + query keys
- [x] 1.3 Unit tests for weekly plan + grocery mappers

## 2. Plan → Nutrition UI

- [x] 2.1 Remove placeholder; build week navigator + day rows
- [x] 2.2 Generate draft + regenerate day / regenerate missing actions
- [ ] 2.3 Day sheet: windows, meal done/skip/unlock/replace (+ recommendation pick) — **not shipped**; superseded by `nutrition-plan-meal-swap` (done/skip/unlock only landed here)
- [x] 2.4 Grocery list sheet/screen with range picker + empty honesty
- [x] 2.5 Tracking-off CTA → Settings → Nutrition

## 3. Integration + QA

- [x] 3.1 Invalidate nutrition plan queries after Log writes when they affect the same day (if applicable)
- [x] 3.2 Maestro / testIDs for Plan → Nutrition happy path if suite covers tabs
- [x] 3.3 Manual: generate week → complete meal → grocery non-empty; tracking off honesty

> **Archive note:** Do not archive this change until `nutrition-plan-meal-swap` lands, or archive with `--skip-specs` after stripping unmet Replace/recommendation-pick requirements from the delta. Promoting the current delta would claim replace shipped.
