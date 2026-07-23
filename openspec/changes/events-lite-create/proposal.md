## Why

Athletes can browse Upcoming Events from Today and More but cannot add a race or life event without opening web. Field planning (registering a race, blocking a travel weekend) needs a lite native create path. Today’s `POST /api/events` is **session-only**, so coach-wattz must accept Bearer writes before mobile can ship.

## What Changes

- Switch coach-wattz `POST /api/events` to `requireAuth` with an appropriate write scope (prefer `goal:write` to match events’ existing `goal:read` list/detail pairing, unless coach-wattz documents a dedicated events write scope).
- Add a native **Create event** flow from the Events list (and empty state) with lite fields (title, date, type, priority, optional location/notes).
- On success, invalidate events queries and open the new event detail.
- Keep **edit / delete**, Intervals sync UI, and full EventForm parity on Open web for this change.

## Capabilities

### New Capabilities

- `events-lite-create`: Native create-event sheet/screen from Events hub; Bearer `POST /api/events`; lite field set; success → detail.

### Modified Capabilities

- `upcoming-events`: Remove “create forbidden” rule; list/empty MUST offer Create; Manage on web remains for edit/delete and advanced fields.

## Impact

- **coach-wattz (required):** Bearer on `POST /api/events` (+ scope allowlist on Official Mobile App if needed); keep session clients working via `requireAuth`.
- **Mobile:** `createEvent` API helper, create UI on Events list, query invalidation, href to detail.
- **Product/docs:** baseline moves “create event” into mobile lite; edit/delete stay web until a later change.
