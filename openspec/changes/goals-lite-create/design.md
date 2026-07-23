## Context

Goals hub (`goals-events-more-hubs`) ships list + read-only detail + Manage on web. Activation already creates a primary goal via Bearer `POST /api/goals` (`goal:write`). Mobile `createGoal` / `CreateGoalInput` exist in `src/features/goals/`. Web still owns the full `EventGoalWizard` (AI suggest/review, multi-event linking, rich fields).

## Goals / Non-Goals

**Goals:**

- Create another goal from More → Goals without leaving the app.
- Cover types: `BODY_COMPOSITION`, `EVENT`, `PERFORMANCE`, `CONSISTENCY`.
- Minimum viable fields per type so the server accepts the create and Today/Athlete teasers stay coherent.
- Invalidate `useGoalsQuery` / primary-goal query on success; land on new goal detail.

**Non-Goals:**

- Native edit / delete / complete / archive.
- AI Suggest / Review on device.
- Full EventGoalWizard parity (distance/elevation/terrain/phase/aiContext, multi-event picker).
- Changing activation goal step UX (may share field components optionally).

## Decisions

### 1. Create-only lite, not full CRUD

**Choice:** Ship create now; edit/delete stay Open web.

**Why:** Matches the user ask (“add new”); avoids PATCH/DELETE UX + status machines; Manage on web remains honest for depth.

**Alternatives:** Full lite CRUD in one change — larger; defer edit/delete.

### 2. Sheet or stack form from Goals list

**Choice:** Prefer a stack screen or form-sheet route (`/(app)/goals/new`) opened from a header/list “Add” control and empty-state CTA — same pattern as other companion creates (e.g. recovery / ad-hoc).

**Why:** Goals list stays scannable; keyboard-friendly full-screen form; deep-linkable later if needed.

### 3. Field set by type (minimum)

| Type | Required | Optional |
|------|----------|----------|
| All | `type`, `title` | `priority` (default MEDIUM), `description` |
| PERFORMANCE / BODY_COMPOSITION | `targetDate` when useful for planning | `metric`, `targetValue`, `startValue` |
| CONSISTENCY | `targetDate` | — |
| EVENT | `targetDate` or nested `eventData` `{ title, date }` | link existing event ids later (web) |

**Choice:** Mirror activation’s minimums; do not require every OpenAPI optional field.

**Why:** Server schema already validates; keep the form short for field use.

### 4. No coach-wattz work

**Choice:** Use existing `POST /api/goals` + `goal:write`.

**Why:** Already Bearer-ready.

## Risks / Trade-offs

- **[EVENT type without calendar event]** → Create goal with target date; optional `eventData` only if product wants a linked stub; otherwise document “link events on web”.
- **[Duplicate of activation UI]** → Extract shared type/title/date controls if duplication bites; not a blocker.
- **[Athletes expect edit next]** → Keep Manage on web visible; follow-up change for edit/delete.

## Migration Plan

- Docs first (baseline + open-questions #34 amend).
- Ship mobile create UI; no API migration.
- Rollback: hide Add CTA; Manage on web still works.

## Open Questions

- Whether EVENT-type create should always create a linked calendar event via `eventData` (web wizard often does). Default for v1: **goal + target date**; optional “also create event” toggle if cheap.
