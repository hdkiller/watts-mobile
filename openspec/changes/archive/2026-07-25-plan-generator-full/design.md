## Context

Activation already calls `initializePlan`, `generateFirstWeekPreview` (polls `generate-ai-week`), and `activatePlan`. Web PlanDashboard adds block generation, AI week instructions, and structured-workout generation as Trigger.dev jobs. This change makes that pipeline a first-class shared mobile module behind Plan + activation.

## Goals / Non-Goals

**Goals:**

- One generator module for activation and Plan tab.
- Initialize → preview → activate happy path with provisional honesty.
- After activate (or on an active plan): trigger/monitor block or week workout generation; generate structure for workouts missing intervals.
- Thumb-first wizard (multi-step screens/sheets), not a desktop modal clone.
- Honest async UX for multi-minute jobs.

**Non-Goals:**

- Adapt / abandon / replan-structure (`plan-adapt-replan`).
- Week tune / drag reschedule / block CRUD (`plan-structure-edit`).
- Templates, share, Intervals publish (web).
- Nutrition plan (`nutrition-plan-on-plan-tab`).

## Decisions

### 1. Shared feature module owns API + wizard UI

`src/features/plans/generator/` (or equivalent) exports hooks + wizard screens. Activation route and Plan Create both render the same flow with different exit navigation (insight vs Plan Training).

### 2. Polling first; push later

Keep request + poll (status/refetch) as the v1 completion signal. Document optional `PLAN_READY`-style push as follow-up; do not block on coach-wattz push work.

### 3. Preview = first week (or near-term) sessions

Match existing plan-lite preview contract; do not require full-season overview modal for activate confirm (Overview can remain read-only on Plan shell).

### 4. Structure generate is part of generator, not structure-edit

Sparkle / “Generate structure” for a workout (and batch week) ships here because it is generation. Moving dates and tuning TSS stay in `plan-structure-edit`.

### 5. AI week instructions = optional sheet

Expose generate-ai-week with a short instruction field when regenerating a week’s workouts; skip desktop anchor-workout multi-select complexity in v1 unless API requires anchors (then minimal picker).

## Risks / Trade-offs

- [Risk] Job timeouts / flaky Trigger.dev → Mitigation: clear progress copy, retry, Open web escape, Sentry on failures.
- [Risk] Activation and Plan diverge again → Mitigation: single module; activation only supplies exit callback.
- [Risk] Scope creep into adapt → Mitigation: hard non-goal; separate change.
- [Risk] Missing Bearer on some generate routes → Mitigation: spike + coach-wattz PR before UI polish.

## Migration Plan

1. Extract shared module from activation plan.tsx without behavior change.
2. Wire Plan Create to module.
3. Add post-activate generation + structure actions.
4. Rollback: leave activation path intact if Plan entry disabled.

## Open Questions

- Whether initialize body needs full web wizard fields (strategy, recovery rhythm, phases) on mobile v1 or keeps lite inputs + server defaults — prefer lite inputs + optional advanced sheet if API requires fields.
- Batch structure-generate API shape for “all in week.”
