## Why

Athletes can create a plan once during activation and browse Upcoming sessions from More, but there is no standing place to live with an active training plan — or a nutrition plan — after onboarding. The product is repositioning so Plan owns season/week life on a fifth tab; this change lands the shell and IA before generator/adapt/nutrition actions.

## What Changes

- Add a fifth bottom tab **Plan** between Today and Log (`Today · Plan · Log · Coach · More`).
- Ship Plan tab chrome with **Training | Nutrition** segments (Nutrition may show a gated placeholder until `nutrition-plan-on-plan-tab`).
- Training segment: active-plan header (title, phase, target date when present), season timeline read, current-week workout list (reuse planned mappers / mini-charts), empty state → Create plan entry (wired fully in `plan-generator-full`).
- Keep **More → Upcoming** as a separate browse list (no merge in this change).
- Open web escape for templates / share / Intervals publish only (copy + handoff); do not imply those are missing native bugs.
- **BREAKING (product/IA):** four-tab shell becomes five-tab; `app-shell` four-tab requirement updates.

## Capabilities

### New Capabilities

- `plan-tab`: Fifth-tab Plan shell with Training | Nutrition segments, active-plan read surfaces, empty/create entry, job/placeholder honesty for follow-on changes.

### Modified Capabilities

- `app-shell`: Authenticated soft-activated navigation is five tabs (Today · Plan · Log · Coach · More).
- `activation-onboarding`: Soft-activated shell reference updates from four tabs to five tabs (wizard behavior unchanged).

## Impact

- **Mobile:** `app/(app)/(tabs)/_layout.tsx` + new `plan` route(s); Plan feature UI under `src/features/plans/`; deep-link/href helpers; Maestro tab labels if covered.
- **APIs:** read active/current plan (`GET /api/plans/active` or documented equivalent) + existing planned-workouts composition; no write pipeline in this change.
- **Docs:** baseline already updated 2026-07-24; this change implements the shell slice.
- **Sequencing:** apply before `plan-generator-full`, `plan-adapt-replan`, `plan-structure-edit`, `nutrition-plan-on-plan-tab`.
