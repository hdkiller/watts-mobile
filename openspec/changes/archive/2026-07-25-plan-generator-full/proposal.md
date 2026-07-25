## Why

Plan tab shell can show an active plan, but create/generate still lives only as activation plan-lite. Athletes need the full training-plan generator pipeline on Plan (and activation must reuse it) so day-one and week-three create/regenerate share one module.

## What Changes

- Promote plan generation into a shared Plan feature module used by activation wizard and Plan → Create / regenerate entry points.
- Support full generator pipeline on device: availability/inputs → `POST /api/plans/initialize` → draft preview → `activate` → background block/week workout generation → per-workout structure generate (single + batch-for-week when API allows).
- First-class async job UX: progress, timeout honesty, failure + retry (reuse/extend polling patterns from `generateFirstWeekPreview`).
- Optional: `generate-ai-week` with instructions for a selected week (mobile sheet, not desktop PlanAIModal clone).
- **BREAKING (product):** `plan-lite` “deep tools stay on web” no longer covers initialize/activate/generate; those are native. Templates/share/Intervals publish remain web.

## Capabilities

### New Capabilities

- `plan-generator`: Shared training plan generator (inputs, initialize, preview, activate, block/week generation, structure generate, job monitoring) for Plan tab and activation.

### Modified Capabilities

- `plan-lite`: Activation plan step becomes a thin host of `plan-generator`; remove requirement that generate/activate depth stays web-only.
- `plan-tab`: Create plan CTA and post-create refresh wire to generator; show generation-in-progress states on Training segment.
- `activation-onboarding`: Plan step references shared generator module (behavior still availability → preview → activate).

## Impact

- **Mobile:** refactor `app/(activation)/plan.tsx` + `src/features/plans/*`; Plan Create / Generate flows; job poller utility; Maestro activation + Plan create paths.
- **coach-wattz:** confirm Bearer on initialize, activate, generate-block, generate-ai-week, generate-structure; optional plan-ready push later (not required to ship polling).
- **Sequencing:** requires `plan-tab-shell`; precedes adapt/replan and structure-edit (structure generate may overlap lightly with structure-edit’s move/tune).
