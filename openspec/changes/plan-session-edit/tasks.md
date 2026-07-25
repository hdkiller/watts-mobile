## 1. Server contract (blocking)

- [x] 1.1 Settle whether a manually edited `COACH_WATTS`-managed session survives `RECALCULATE_WEEK` — **Preferred: server re-tags content edits to `managedBy: 'USER'`** (mobile does not warn at save).
- [x] 1.2 Confirm Bearer + scopes on `POST /api/planned-workouts` and `DELETE /api/planned-workouts/{id}` — **`workout:write`** (same as PATCH; not `plan:write`).
- [x] 1.3 Confirm which fields `PATCH /api/planned-workouts/{id}` accepts, and whether a `trainingWeek` association is needed — title/type/duration/TSS/description (+ date); create may pass optional `trainingWeekId`.
- [x] 1.4 Confirm whether deletion is recoverable — **hard delete → confirm-only, no undo**.

## 2. API + state

- [x] 2.1 Add `createPlannedWorkout`, `patchPlannedWorkout` (full field set), `deletePlannedWorkout` to `src/features/plans/api.ts`
- [x] 2.2 Add mutations in `usePlans.ts` invalidating plan week sessions and upcoming planned
- [x] 2.3 Unit tests for the session payload mapper and validation rules

## 3. UI

- [x] 3.1 Session editor sheet: title, type, duration, TSS, description; shared by create and edit
- [x] 3.2 Add-session entry point in the week view with the tapped day pre-selected, constrained to the plan week
- [x] 3.3 Edit + delete in the `SessionRow` action sheet alongside Move and Generate structure
- [x] 3.4 Edit + delete on `app/(app)/planned/[id].tsx` alongside Complete and Skip
- [x] 3.5 Delete confirm; undo only if 1.4 says restoration is real — **confirm-only**
- [x] 3.6 Adaptation-overwrite warning at edit time if 1.1 resolves that way — **N/A (server re-tag)**

## 4. QA

- [ ] 4.1 Verify week target stats and Upcoming reflect created and deleted sessions
- [x] 4.2 testIDs for add-session, editor fields, and delete confirm
- [ ] 4.3 Manual: add session → appears in week and Upcoming → edit duration → delete; run a plan adapt and confirm edited sessions behave as 1.1 decided
