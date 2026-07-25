## Context

Web `PlanWizard.vue` is a 6-step flow: Goal → Strategy (+ timeline) → Phases → Anchors → Details → Review → activate. Mobile `PlanGeneratorPanel` is a 4-step lite path that already sends most initialize fields but hardcodes start=today, omits `endDate`, takes `goalId` as a prop with no picker, and activates with `{}`.

Goal APIs already exist on mobile (`useGoalsQuery`, `pickPrimaryGoal`, `/(app)/goals/new`). Plan create resolves primary goal; activation plan only uses `activation.primaryGoalId`.

## Goals / Non-Goals

**Goals:**

- Athlete can select which goal the plan is built for inside the generator (Plan create and activation).
- Initialize carries explicit `startDate` + `endDate` (or duration-derived end).
- Activate sends the same `startDate` used at initialize.
- Preview includes a short phase/block glance plus first-week sessions.
- Keep thumb-first companion UX (not a desktop wizard clone).

**Non-Goals:**

- Nested `EventGoalWizard` / calendar event multi-select create inside the generator.
- Anchor workout picker (`anchorWorkoutIds`) — follow-up.
- Rich availability (AM/PM, multi-slot, indoor flags).
- Templates, share, Intervals publish.
- Changing goal after activate without a new generate.

## Decisions

### 1. Goal step first (web parity), with smarter defaults

Web never auto-selects. Mobile will:

| Goals | Behavior |
|-------|----------|
| 0 | Show empty state + Create goal CTA → `/(app)/goals/new` (return preserves form) |
| 1 | Auto-select; show confirmation row (changeable) |
| Many | Radio list; default = `initialGoalId` prop \|\| `pickPrimaryGoal` |

**Why:** Companion activation already collected a primary goal; forcing a second tap is friction. Multi-goal athletes still get an explicit choice like web.

**Alt considered:** Prop-only goal (status quo) — rejects multi-goal / wrong-primary cases.

### 2. Create goal out-of-flow

Link to existing goals/new rather than nesting EventGoalWizard. On focus/return, refetch goals and prefer newly created id when obvious (query invalidate + optional `createdGoalId` param later).

**Why:** Full EVENT create needs events/`eventData`; duplicate that in the generator is scope creep.

### 3. Calendar: start + duration OR end-from-goal

On Timeline (start/end), then Approach (starting phase + notes + advanced):

- **Start:** date control; default today (local calendar date → noon local/UTC-safe ISO consistent with existing helpers).
- **End mode:**
  - **From goal** (default when goal has target/event date): send that date as `endDate`.
  - **Duration:** 4–52 weeks chips/stepper → compute end from start.

Always send `endDate` on initialize when known so server does not 400 on goals without dates.

### 4. Phase glance, not Phase editor

After initialize, show `plan.blocks` as title + week count (+ dates if present) above the first-week workout list. No edit/reorder.

### 5. Activate body

`activatePlan(planId, startDate)` already supports optional startDate — always pass the initialize startDate ISO/date the server expects.

Anchors deferred: document in open questions / follow-up change.

### 6. Step model

Insert **Goal** before Days (or merge goal into first screen if space allows). Prefer dedicated step so activation users who already have a goal can confirm/skip quickly.

Form steps become: Goal → Days → Volume → Sports → Timeline (start/end) → Approach (starting phase + notes + advanced) → working → preview (phases + week) → activate.

## Risks / Trade-offs

- [Risk] Athlete creates goal mid-flow and returns to empty selection → Mitigation: refetch on focus; auto-select sole/new primary.
- [Risk] Goal without target date + duration not chosen → Mitigation: require duration or block Generate with clear copy.
- [Risk] TZ off-by-one on startDate → Mitigation: use local date-key helpers already used in plan mappers; avoid raw UTC midnight.
- [Risk] Activation + Plan create diverge again → Mitigation: picker lives only inside shared `PlanGeneratorPanel`.

## Migration Plan

1. Ship goal step + endDate/startDate + activate startDate + phase glance in one PR.
2. No server migration; older clients keep working.
3. Rollback: revert panel; hosts still pass `goalId` prop as default.

## Open Questions

- Whether to surface a minimal “keep existing planned sessions” toggle later (anchors) without full multi-select.
- Exact date picker component (native spinner vs calendar sheet) — follow existing app patterns when implementing.
