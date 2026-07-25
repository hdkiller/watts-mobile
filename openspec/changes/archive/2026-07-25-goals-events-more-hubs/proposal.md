## Why

Athletes can see race/life events from Today and a single primary goal on Athlete, but there is no discoverable Goals or Events hub under More. Athlete’s inline goal rename is a half-management affordance that neither matches web’s full Goals/Events suite nor a clear companion pattern (list → detail → Open web to manage). Web already owns full CRUD (`/profile/goals`, `/events`); mobile needs proper browse/detail IA and a clean escape for management.

## What Changes

- Add **More → Goals** and **More → Events** entries that open first-class list screens.
- Ship a **Goals list** (all active goals, not only primary) and a **Goal detail** read surface (type, dates, linked events, progress fields when present).
- Reuse the existing Upcoming Events list + event detail; make Events reachable from More (not only Today glance).
- On Athlete (**View profile & biometrics**): replace inline goal title edit with a summary that navigates to Goals hub / goal detail; keep Open web for full management.
- Keep **create / edit / delete** for goals and events on **Open web** (`/profile/goals`, `/events`) for this change — no native EventForm / EventGoalWizard port, no Bearer event write work yet.
- Activation goal create remains as today (soft-activation path).
- **BREAKING (product):** “Ongoing goal lite edit” on Athlete becomes browse/detail + Open web manage, not in-place title PATCH (activation create unchanged).

## Capabilities

### New Capabilities

- `goals-hub`: More → Goals list + goal detail (read), empty states, Open web manage to `/profile/goals`.

### Modified Capabilities

- `goal-lite`: After activation, ongoing surface is Goals hub / detail + Open web for manage; remove requirement for Athlete inline title edit as the primary ongoing edit path.
- `upcoming-events`: Events list MUST be reachable from More (in addition to Today glance); manage remains Open web.
- `account-more`: More hub includes Goals and Events rows under the workouts/glance area.

## Impact

- **Mobile:** new Goals routes, More menu rows, Athlete `GoalsLiteSection` rewrite (summary + navigation), deep-link/href helpers; Events href from More to existing `/(app)/events`.
- **coach-wattz:** none required for this change (existing Bearer `GET /api/goals`, `GET /api/events`, `GET /api/events/:id`). Event write + goal DELETE Bearer remain future work if native CRUD is desired later.
- **Product/docs:** baseline IA updates More hosts Goals + Events; event/goal CRUD stays web until a future lite-CRUD change.
