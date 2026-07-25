## 1. API + state

- [x] 1.1 Confirm Bearer + `nutrition:write` scope on `PATCH /api/nutrition/{id}/items` and `/notes` in coach-wattz allowlist
- [x] 1.2 Keep the item array in `mapNutrition` instead of discarding it; add `NutritionLoggedItem` type
- [x] 1.3 Add `patchNutritionItems` / `patchNutritionNotes` to `src/features/nutrition/api.ts`
- [x] 1.4 Add mutations + query invalidation (today, glance, plan) in `useNutrition.ts`
- [x] 1.5 Unit tests for the item mapper and the optimistic delete rollback

## 2. Day entries UI

- [x] 2.1 Render the entries list in `NutritionSection` (collapsed on Today, full in the detail sheet)
- [x] 2.2 Edit sheet pre-filled from the row, reusing the existing BottomSheet field pattern
- [x] 2.3 Delete with confirm + optimistic removal and rollback on failure
- [x] 2.4 Hide row actions for items with no id
- [x] 2.5 Day notes field with save + honest error state
- [x] 2.6 Empty-day copy; no fabricated rows

## 3. Integration + QA

- [ ] 3.1 Verify Today totals, rings, and fuel state refresh after edit and after delete
  <!-- Blocked on deploying coach-wattz items.patch Bearer fix to the instance under test.
       Observed: entries list shows logged Banana; edit sheet opens pre-filled; production
       PATCH /items returns 401 for Bearer until requireAuth lands. -->
- [x] 3.2 testIDs for entries list, edit sheet, and delete confirm
- [ ] 3.3 Manual: log meal → edit macros → totals change → delete → totals revert; offline/failure path shows honest error
  <!-- Partial: logged Banana via quick-log; opened detail → Logged items → action sheet Edit/Delete.
       Full edit/delete against production blocked on server Bearer allowlist deploy (local fix ready). -->
