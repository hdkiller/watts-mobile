## 1. Events data layer

- [x] 1.1 Extend `EventApi` / glance types for city, country, location, priority, description, startTime, websiteUrl, distance, elevation, expectedDuration, and goals
- [x] 1.2 Enrich `mapEventGlance` / `mapUpcomingEvents` with web-parity meta (`subType|type · city, country` with `location` fallback) and keep past-event exclusion + soonest-first sort
- [x] 1.3 Add `fetchEvent(id)` → `GET /api/events/:id` and `useEventDetailQuery(id)` (reuse `EVENTS_QUERY_KEY` family)
- [x] 1.4 Add/update unit tests in `src/features/events/__tests__/` for mapping, countdown, and past filtering

## 2. Today Upcoming Events glance

- [x] 2.1 Build `UpcomingEventsGlance` (header + count, max 3 rows with month/day block, title, meta, countdown, chevron)
- [x] 2.2 Mount glance on Today below primary CTAs near Coming up; omit section when empty; failures must not block hero
- [x] 2.3 Remove `EventCountdownChip` from Today and the Coming up “Next event” footer line

## 3. List + detail screens

- [x] 3.1 Add Today stack routes: `today/events/index` (See all list) and `today/events/[id]` (lite read-only detail)
- [x] 3.2 Wire glance row → detail and See all → list; list row → detail
- [x] 3.3 Detail UI: date/title/type, priority, distance/elevation/location tiles when present, start time, description, linked goals; Open web → `/events/:id` via session handoff; no edit/delete

## 4. Deep links + docs

- [x] 4.1 Map authenticated `/events/:id` (and scheme equivalent) to the new detail route in linking helpers
- [x] 4.2 Update `docs/product-baseline.md` Today IA: Upcoming Events glance replaces countdown chip + Coming up next-event line
- [x] 4.3 Smoke: athlete with upcoming race sees glance → detail → Open web; athlete with none sees no section; Coming up remains planned-only
