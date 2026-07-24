## Context

Baseline (2026-07-24) expands the companion to a five-tab IA with a standing Plan surface. Activation already ships plan-lite initialize/preview/activate inside `app/(activation)/plan.tsx` and `src/features/plans/api.ts`. Upcoming planned lives under More. This change only adds the Plan tab shell and read surfaces so later changes can attach generator, adapt, structure, and nutrition without fighting IA.

## Goals / Non-Goals

**Goals:**

- Fifth tab Plan with Training | Nutrition segment control.
- Read-only (or near-read) Training view of the active plan + current week sessions.
- Honest empty state when no active plan; Create entry point stub that later changes own.
- Nutrition segment visible but may defer full UI to `nutrition-plan-on-plan-tab` with clear placeholder when tracking off or not yet implemented.
- Preserve Today as one-decision; preserve Upcoming as separate More list.

**Non-Goals:**

- Initialize / activate / adapt / replan / structure writes (later changes).
- Nutrition plan generate / meals / grocery (later change).
- Templates, share, Intervals publish (stay web).
- Merging Upcoming into Plan.
- Desktop PlanDashboard DnD parity.

## Decisions

### 1. Tab order: Today · Plan · Log · Coach · More

Plan sits after Today so morning decision stays leftmost, but season work is one thumb away. Alternatives considered: More → Plan row (rejected — product chose fifth tab); Plan leftmost (rejected — dilutes Today).

### 2. Segments, not nested tabs

Training | Nutrition uses an in-screen segmented control (same pattern as Athlete glance Activity | Nutrition). Avoids a sixth bottom tab and keeps one Plan route.

### 3. Compose week from active plan + planned workouts

Prefer `GET /api/plans/active` (or `/current`) for header/timeline metadata and existing `GET /api/planned-workouts` (filtered to current week) for session rows with structuredWorkout mini-charts. Avoid inventing a new BFF in this change unless active-plan payload already embeds weeks.

### 4. Create entry is a stub route/CTA

Empty Training shows Create plan CTA routing into a placeholder or existing activation-style form host that `plan-generator-full` will own. Do not half-implement the wizard here.

### 5. Nutrition placeholder honesty

Until `nutrition-plan-on-plan-tab`, Nutrition segment shows tracking-off copy or “Nutrition plan coming soon” / Open web `/nutrition` — never a fake meal grid.

## Risks / Trade-offs

- [Risk] Active-plan Bearer shape incomplete → Mitigation: spike `GET /api/plans/active` early; fall back to documented composition; task for coach-wattz if 401/404.
- [Risk] Five tabs crowd Android labels → Mitigation: keep short “Plan” label; verify NativeTabs labeled mode.
- [Risk] Duplication with Upcoming / Coming up → Mitigation: Plan shows plan context + this week; Upcoming remains capped browse list; copy differs.
- [Risk] Activation plan-lite and Plan tab diverge → Mitigation: next change extracts shared module; shell only links Create.

## Migration Plan

1. Land tab + empty/read UI behind normal release.
2. No data migration.
3. Rollback = remove Plan trigger (docs would need revert — treat as product commit).

## Open Questions

- Exact active-plan JSON fields for season timeline (confirm against coach-wattz PlanDashboard reads during implement).
- Whether Nutrition placeholder Open web uses handoff to `/nutrition` or stays in-app empty until change 5 ships (prefer in-app placeholder + optional Open web).
