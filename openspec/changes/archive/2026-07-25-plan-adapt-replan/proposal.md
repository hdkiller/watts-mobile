## Why

When life blows up — missed week, travel, illness — athletes currently must Open web to adapt or replan. Plan tab now owns plan life; this change adds confirm-gated adapt, replan-structure, abandon, and start-new so the companion can recover the season without a desktop detour.

## What Changes

- Add Plan → Training actions for **Adapt**: Recalculate Remaining Week and Push Schedule Forward 1 Day (`POST /api/plans/adapt`).
- Add **Replan structure** when API/product supports regenerating remaining block structure (`POST /api/plans/:id/replan-structure` or documented successor).
- Add **Abandon plan** (confirm) and **Start new plan** (abandon or archive path → shared generator).
- Job/progress honesty for adapt/replan background work; refresh Plan shell on completion.
- Keep templates/share/Intervals publish on web.

## Capabilities

### New Capabilities

- `plan-adapt-replan`: Adapt week actions, replan structure, abandon, start new — confirm-gated Plan ownership of disruption recovery.

### Modified Capabilities

- `plan-tab`: Expose adapt/replan/abandon/start-new entry points on Training when an active plan exists.
- `plan-generator`: Start new plan reuses generator after abandon/clear active plan.

## Impact

- **Mobile:** Plan Training action menu/sheets; mutations + job monitoring; confirm dialogs; query invalidation.
- **coach-wattz:** Bearer on adapt / replan-structure / abandon; document response/job shapes.
- **Sequencing:** after `plan-tab-shell` + `plan-generator-full`.
