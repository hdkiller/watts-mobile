## Why

Mobile nutrition logging is append-only. `src/features/nutrition/api.ts` writes with `POST /api/nutrition` and nothing else — there is no update and no delete. An athlete who logs the wrong meal, double-taps save, or mis-estimates macros cannot correct it on device; the only recovery is opening the web app. Web has done this since `FoodItemModal.vue` via `PATCH /api/nutrition/{id}/items` with `action: add | update | delete`.

This is a correctness and trust gap, not a parity nicety: a tracker the athlete cannot correct stops being trusted, and every wrong row silently poisons daily totals, fuel state, and the targets shown on Today.

## What Changes

- Add a day entries list to the nutrition surface showing each logged item (name, macros, meal slot, time) rather than day totals only.
- Support editing a logged item (name, calories, protein, carbs, fat, amount/unit, meal slot) via Bearer `PATCH /api/nutrition/{id}/items` with `action: 'update'`.
- Support deleting a logged item via the same endpoint with `action: 'delete'`, behind a confirm, with optimistic removal and rollback on failure.
- Add day notes read/write via `PATCH /api/nutrition/{id}/notes`.
- Invalidate today-nutrition, glance, and plan queries after any edit so totals, rings, and fuel state stay consistent.
- Keep the existing quick-log compose flow unchanged — this change adds correction, it does not restructure capture.

## Capabilities

### New Capabilities

- `nutrition-log-editing`: View, correct, and delete individual logged nutrition items for a day, plus day notes.

### Modified Capabilities

- `nutrition-quick-log`: Quick-log stays the capture path, but a logged item is no longer terminal — the day view exposes edit/delete for what was captured.

## Impact

- **Mobile:** `src/features/nutrition/api.ts` (items patch, notes patch), `useNutrition.ts` (mutations + invalidation), `NutritionSection.tsx` (entries list + row actions), new edit sheet; unit tests for the item mapper and optimistic update.
- **coach-wattz:** Confirm Bearer/scope allowlist on `PATCH /api/nutrition/{id}/items` and `PATCH /api/nutrition/{id}/notes` (`nutrition:write`). No server behaviour change expected — both routes already exist and are exercised by web.
- **Sequencing:** Independent. Ship before `nutrition-plan-meal-swap`; corrections matter more than swaps, and both touch the same query keys.
- **Note:** `PATCH .../items` requires the day's nutrition row id. On a day with no row yet there is nothing to edit, so the entries list is empty rather than erroring.
