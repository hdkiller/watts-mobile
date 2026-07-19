## Why

Athletes train toward races and life events, but Today’s Coming up strip is planned workouts only — nothing connects daily sessions to the A-race or key date on the calendar. Product already decided race/life events come next (open-questions #19; issue 026); planned teasers shipped.

## What Changes

- Fetch upcoming race/life events from coach-wattz `GET /api/events` (Bearer) and surface a thin **event countdown** on Today (e.g. “Gran Fondo — 23 days”) without turning Today into a calendar.
- Optionally show the next 1–2 events in Coming up / Upcoming as distinct event rows (or a quiet “Next event” line), separate from planned-workout rows.
- **coach-wattz:** migrate `GET /api/events` (and any needed single-event read) from session-cookie-only to `requireAuth` + an appropriate REST scope (likely `goal:read`; confirm against Official Mobile App / `REST_OAUTH_SCOPES` — there is no dedicated `events:` scope today).
- Add companion OAuth scope(s) required for event reads if not already requested.
- Update product baseline / open-questions: Coming up may include race/life events; heatmaps and event authoring stay out.
- Keep Open web for create/edit events, plan linking, and full Events page.

## Capabilities

### New Capabilities

- `calendar-events-glance`: Read upcoming race/life events over Bearer; countdown chip + thin list rows for field glance (not a calendar UI).

### Modified Capabilities

- `today-home`: Allow a thin next-event countdown (and optional event rows in Coming up) alongside planned workouts; still no heatmap / CTL.
- `upcoming-planned`: Upcoming list MAY include a small “Events” section or interleaved event rows when data exists; planned detail contract unchanged.
- `oauth-pkce`: Request any new/confirmed scope needed for event reads (e.g. `goal:read`) if not already on the companion client.

## Impact

- **watts-mobile:** Today Coming up strip, optional Upcoming section, `src/features/events/` (or similar), scopes, docs.
- **coach-wattz:** Bearer on events list (and scope wiring); no new BFF required if list payload is enough for title/date/priority.
- **Out of scope:** Calendar heatmap, month grid, drag-reschedule, event create/edit in-app, plan architect, goals CRUD, Intervals sync UI.
