## Why

Athletes plan training around race-day A/B/C events, but Today only surfaces the next race as a quiet countdown chip and a one-line “Next event” under Coming up — both open the web calendar. Web already shows a dedicated Upcoming Events glance (date block, type · location, days-until) and a rich event detail page. Mobile should give the same field-readable race context without becoming an events manager.

## What Changes

- Add an **Upcoming Events** glance on Today (web Athlete Profile parity): capped upcoming race/life events with month/day block, title, subtype · location meta, countdown, and chevron.
- Navigate taps to a **lite in-app event detail** (read-only) mirroring the web event summary: date/title/type, priority, distance/elevation/location tiles, start time, description, linked goals when present — not create/edit/delete.
- “See all” opens a thin Upcoming Events list (or More/Today stack list) capped similarly to Upcoming planned; deeper management stays **Open web** → `/events` / `/events/:id`.
- Retire or demote the existing countdown chip + Coming up “Next event” line so races are not shown three ways.
- Keep **Coming up** planned-workout-only (no mixing races into planned rows).
- Reuse existing Bearer APIs: `GET /api/events` and `GET /api/events/:id` (`goal:read` already in companion scopes). Extend client mapping for city/country/location/priority/description/startTime/websiteUrl/goals.

## Capabilities

### New Capabilities
- `upcoming-events`: Upcoming race/life events list + lite read-only detail, backed by `/api/events` and `/api/events/:id`.

### Modified Capabilities
- `today-home`: Today gains an Upcoming Events glance (web-parity rows); demote/remove the quiet countdown chip and Coming up next-event line so race context has one clear home.

## Impact

- **Mobile UI:** `app/(app)/(tabs)/today/*`, new event list/detail routes under Today (or More) stack; replace `EventCountdownChip` usage; new glance component alongside `ComingUpStrip`.
- **Client data:** `src/features/events/*` — richer `EventApi` / glance types, detail fetch + query hooks, mapping for location meta and countdown (existing `mapEvents` foundation).
- **API (coach-wattz):** No new endpoints required. Relies on existing `GET /api/events` (+ goals include) and `GET /api/events/:id` with Bearer `goal:read`.
- **Out of scope:** Event create/edit/delete, calendar heatmap, public event landings, goal editing, Intervals sync UI — Open web only.
- **Product baseline:** Promotes race context from “optional countdown chip” to a first-class Today glance (still below primary CTAs).
