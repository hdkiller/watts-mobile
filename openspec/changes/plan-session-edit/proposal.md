## Why

The Plan tab can reshape a season but not a single session. `PlanTrainingSegment` can tune a week, generate AI weeks and blocks, replan structure, reorder blocks, and move a session to another day — but the only field it ever writes on a planned workout is `date`. An athlete who wants to add a club ride the plan doesn't know about, shorten Thursday because of a late meeting, or delete a duplicate the generator produced has no path on device.

The server already supports all of it: `POST /api/planned-workouts` (create), `PATCH /api/planned-workouts/{id}` (title, type, duration, TSS, description), `DELETE /api/planned-workouts/{id}`. Mobile calls the PATCH route with a date and ignores the rest.

This is the last gap between "the app can generate a plan" and "the app owns the plan". Without it, every small real-world deviation pushes the athlete back to web — which is exactly the moment they are on a phone and away from a desk.

## What Changes

- Add a planned session to a chosen day from the Plan tab week view: title, sport/type, duration, optional TSS, optional description.
- Edit an existing planned session's title, type, duration, TSS, and description from the planned detail screen and from the week row's action sheet.
- Delete a planned session behind a confirm, with the existing move-undo pattern extended to deletion where the server allows re-creation.
- Keep move-to-day, generate-structure, complete, and skip exactly as they are.

## Capabilities

### New Capabilities

- `plan-session-edit`: Create, edit, and delete individual planned workouts from the Plan tab and planned detail.

### Modified Capabilities

- `plan-lite`: A plan is editable at session granularity, not only at week and block granularity.

## Impact

- **Mobile:** `src/features/plans/api.ts` (create, full patch, delete), `usePlans.ts` (mutations + invalidation of `PLAN_WEEK_SESSIONS_QUERY_KEY` and upcoming), `PlanTrainingSegment.tsx` (add-session entry point; edit/delete in the session action sheet), `app/(app)/planned/[id].tsx` (edit + delete actions), new session editor sheet.
- **coach-wattz:** Confirm Bearer + `plan:write` on `POST /api/planned-workouts` and `DELETE /api/planned-workouts/{id}`, and confirm which fields `PATCH` accepts for a `COACH_WATTS`-managed workout. Editing an AI-managed session may need a `managedBy` transition so the next plan adaptation does not silently overwrite the athlete's edit — this must be settled before implementation.
- **Non-goals honoured:** No plan architect board, no drag-and-drop, no templates or save-as-template, no library link/publish/unlink, no structured-workout push to Intervals.icu. This is session CRUD through sheets, in the existing mobile idiom.
- **Sequencing:** Independent of the nutrition changes; can run in parallel.
