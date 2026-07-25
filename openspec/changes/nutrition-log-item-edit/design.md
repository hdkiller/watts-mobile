## Context

`GET /api/nutrition?startDate&endDate` already returns the day row with its items; mobile's `pickTodayNutrition` in `mapNutrition.ts` collapses it straight to totals and discards the item array. So the data needed for an entries list is already on the wire — the mapper throws it away.

Writes are asymmetric today: create is `POST /api/nutrition` (whole-item append), while update and delete are `PATCH /api/nutrition/{id}/items` keyed by the **day row id**, with `mealType` (`breakfast | lunch | dinner | snacks`) and an item payload. The server recalculates day totals and re-runs `metabolicService` / `nutritionPlanService` after every patch, so the client must not compute totals locally — it re-reads.

## Goals / Non-Goals

**Goals:**

- See what was actually logged for a day, not just the sum.
- Correct a wrong item in place; delete a bad one.
- Day notes read/write.
- Totals, rings, and fuel state reflect the correction immediately.

**Non-Goals:**

- Re-designing the quick-log compose form (separate concern).
- AI free-text logging (`POST /api/nutrition/{id}/log`) — separate change.
- Nutrition history / trends screens.
- Recomputing macros or fuel state on device.

## Decisions

### 1. Entries list lives in `NutritionSection`, not a new route

`NutritionSection` already owns the day pager, totals, and hydration, and is reused by both Today and `NutritionDetailSheet`. Adding the entries list there means the correction path appears everywhere the day already appears, with no new navigation.

### 2. Edit opens a sheet pre-filled from the row

Reuse the `BottomSheet` + field pattern from `PlanTrainingSegment`'s tune-week sheet rather than inventing an editor. Same fields as quick-log compose, pre-populated, so there is one mental model for "meal shape".

### 3. `mealType` comes from the item, not the user

The patch endpoint requires `mealType` to locate the item. Derive it from the row being edited and keep it editable in the sheet — moving an item between slots is a `delete` + `add`, which the server's action enum supports within one call sequence. If the slot is unchanged, a single `update` suffices.

### 4. Delete is optimistic with rollback; edit is not

Delete has an unambiguous local outcome (row disappears) so optimistic removal is safe and makes the correction feel instant. An edit changes server-recalculated totals we cannot predict, so it shows a pending state and re-reads instead of guessing.

### 5. Confirm on delete, not on edit

Deleting is the only irreversible action here. Edits are re-editable.

## Risks / Trade-offs

- [Risk] Item ids may be absent on legacy rows → Mitigation: the schema marks `id` optional; hide row actions when the item has no id rather than sending an unresolvable patch.
- [Risk] Optimistic delete diverging from server totals → Mitigation: invalidate and re-read on settle; the optimistic step only hides the row.
- [Risk] Correction UI crowding the Today card → Mitigation: entries list is collapsed to the last few items on Today, full list in the detail sheet.
- [Risk] A day with no nutrition row has no `{id}` to patch → Mitigation: treat as empty state; nothing to correct.

## Migration Plan

Additive. `mapNutrition` keeps returning today's totals unchanged and gains an `items` field alongside them, so existing consumers are untouched.

## Open Questions

- Whether `absorptionType` should be editable on mobile or left to the server's inference — default: leave it out of the mobile sheet.
- Whether moving an item between meal slots is worth v1, or edit-in-place only.
