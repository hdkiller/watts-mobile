## Context

Web edits sessions through `PlanArchitectWorkoutDrawer.vue` and `PlannedWorkoutModal.vue`, both attached to a drag-and-drop architect board. The board is an explicit mobile non-goal (`docs/product-baseline.md`), but the **operations** it performs are not — they are ordinary session CRUD that happens to be presented on a board. This change takes the operations and leaves the board.

Mobile already has the right containers: `PlanTrainingSegment` renders week sessions as `SessionRow`s with a long-press action sheet (currently Move / Generate structure), and `app/(app)/planned/[id].tsx` is a full detail screen with Complete / Skip. Both are natural homes for edit and delete without new navigation.

One unresolved server-side question shapes this work: planned workouts created by the generator carry `managedBy: 'COACH_WATTS'`, and plan adaptation (`/api/plans/adapt`, `RECALCULATE_WEEK`) deletes and regenerates AI-managed sessions. An athlete's manual edit to such a session may therefore be silently discarded on the next adapt.

## Goals / Non-Goals

**Goals:**

- Add a session the plan doesn't know about.
- Adjust a session's shape when life changes it.
- Remove a session that shouldn't be there.
- Do all three without leaving the phone, in the existing sheet idiom.

**Non-Goals:**

- Plan architect board, drag-and-drop, or timeline editing.
- Plan templates, save-as-template, public catalog (explicit product non-goals).
- Library link / publish / unlink; structured-workout push to Intervals.icu.
- Interval-level structure authoring — structure stays AI-generated via the existing generate-structure path.
- Bulk operations (`/api/plans/workouts/future|past|orphaned`).

## Decisions

### 1. One editor sheet serves create and edit

Same fields, same validation, different submit target. Pre-filled for edit, empty with the tapped day pre-selected for create. Avoids two divergent forms for one concept.

### 2. Entry points follow where the athlete already is

Create from the week view (day pre-selected). Edit and delete from the session action sheet and from planned detail. No new route.

### 3. Manual edits must survive adaptation (settled: server re-tag)

**Decision:** content edits via `PATCH` re-tag `managedBy` from `COACH_WATTS` to `USER` on the server, so `RECALCULATE_WEEK` / adapt cleanup will not delete them. Mobile does not show an overwrite warning at edit time. Creates are always `USER`-managed.

### 4. Structure is not authored by hand

Duration, TSS, and description are editable; intervals are not. If an edited session loses its structure server-side, the existing "Generate structure" action is the recovery path, and the row's structure state already surfaces that.

### 5. Delete confirms (no undo)

Deletion is a hard delete. Offer confirm-only — no false undo affordance.

## Risks / Trade-offs

- [Risk] Manual edits silently overwritten by plan adaptation → Mitigation: decision 3; blocked on task 1.1.
- [Risk] Athlete-created sessions distorting plan compliance or TSS targets → Mitigation: they flow through the same planned-workout endpoints web uses, so server-side rollups treat them identically; verify against week target stats.
- [Risk] Session CRUD drifting toward an architect → Mitigation: no board, no drag, no multi-select; sheets only.
- [Risk] A created session landing outside the active plan's weeks → Mitigation: constrain the day picker to the plan week being viewed, as the move sheet already does.

## Migration Plan

Additive. Existing move, generate-structure, complete, and skip paths are untouched.

## Open Questions

Resolved with task 1.x: PATCH accepts the content field set and re-tags `managedBy`; create may include optional `trainingWeekId`; delete is hard (confirm-only).
