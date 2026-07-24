## Why

Generator and adapt cover create/recover, but athletes still need light structure edits on device: retune a week’s focus/volume, move a session a day, and adjust blocks without opening the desktop PlanDashboard. This change adds mobile-pattern structure editing on Plan → Training.

## What Changes

- Week tuning: focus / volume / TSS / recovery-week flag via `PATCH /api/plans/weeks/:id`.
- Reschedule/move planned workouts via `POST /api/workouts/planned/:id/move` (or documented successor) with a mobile date picker / swap flow — not desktop DnD tables.
- Block CRUD lite: add/reorder/rename/retype/duration via plan blocks APIs, using sheets/lists suitable for thumbs.
- Refresh Plan week + Upcoming after edits.
- **Non-goal:** pixel-parity PlanArchitectBoard / drag calendars; templates/share/Intervals publish remain web.

## Capabilities

### New Capabilities

- `plan-structure-edit`: Week tune, planned-workout move/reschedule, block structure CRUD with mobile interaction patterns.

### Modified Capabilities

- `plan-tab`: Training segment exposes tune/move/block edit entry points when an active plan exists.

## Impact

- **Mobile:** Plan Training editors/sheets; mutations; optimistic or confirm-then-refresh UX.
- **coach-wattz:** Bearer on week PATCH, planned move, block CRUD routes.
- **Sequencing:** after `plan-tab-shell`; can parallelize carefully with generator but prefer after generator so week list exists.
