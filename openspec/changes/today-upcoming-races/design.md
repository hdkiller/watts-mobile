## Context

Web dashboard `AthleteProfileCard` shows an **Upcoming Events** module (max 3): month/day block, title, `subType|type · city, country`, cyan days-until, chevron → `/events/:id`. Event detail (`/events/:id`) shows priority, distance/elevation/duration/location tiles, start time, website, description, and linked goals.

Mobile already fetches `GET /api/events` (`goal:read` in companion scopes) and maps upcoming glances, but surfaces them only as:
1. `EventCountdownChip` — next event title + countdown → Open web `/calendar`
2. Quiet “Next event: …” line under Coming up (planned workouts)

Product baseline still describes race/life events as a countdown chip + optional Coming up line — this change elevates them to a dedicated glance without becoming an events CRUD app.

## Goals / Non-Goals

**Goals:**
- Web-parity Upcoming Events glance on Today (below primary CTAs / week glance, near Coming up)
- Lite read-only event detail in-app from list/glance taps
- Thin “See all” list for the rest of upcoming events
- Single clear race surface (remove duplicate chip / Coming up line)
- Reuse existing Bearer events APIs — no new coach-wattz endpoints

**Non-Goals:**
- Create / edit / delete events or goals
- Full `/events` table, sync status, Intervals import UI
- Public event landings / campaign slugs
- Merging races into the Coming up planned strip
- Calendar heatmap or multi-month browser
- Dashboard settings toggle for the module (web athlete-profile module prefs stay web-only; mobile shows when ≥1 upcoming event)

## Decisions

1. **Data: existing list + detail endpoints**  
   - List: `GET /api/events` → filter `date >= today` (athlete local day), sort soonest-first, glance cap **3** (web parity).  
   - Detail: `GET /api/events/:id` with `goals` include.  
   Extend `EventApi` / mappers for `city`, `country`, `location`, `priority`, `description`, `startTime`, `websiteUrl`, `goals[]`.  
   *Alternative:* fold into `GET /api/mobile/today` — nicer cold-start later; not required for this change.

2. **Today placement**  
   New `UpcomingEventsGlance` section **after** Week glance / **before or after** Coming up (prefer **before** Coming up so race context sits above routine sessions). Hide entire section when zero upcoming events (no dense empty chrome). Header: “Upcoming Events” + count badge + See all.  
   *Alternative:* replace Coming up — rejected; planned workouts remain a separate job.

3. **Retire duplicate race UI**  
   Remove `EventCountdownChip` from Today and the Coming up “Next event” footer line. Countdown lives on each glance row (and detail).  
   *Alternative:* keep chip in the hero — clutter; three surfaces for one fact.

4. **Navigation / IA**  
   - Row tap → `/(app)/(tabs)/today/events/[id]` (stack under Today, mirrors planned/activity).  
   - See all → `/(app)/(tabs)/today/events` list (capped ~next events, not a calendar).  
   - Detail “Open web” → session-handoff `/events/:id` for edit/manage.  
   *Alternative:* sheet-only detail — weaker deep-link story; stack screen preferred.

5. **Detail content (lite)**  
   Read-only: formatted date, title, type/subType, priority badge, tiles for distance (km) / elevation (m) / location when present, start time, description, linked goals (title + status/target when available). Omit empty tiles. Website → open external URL (or Open web). No Edit/Delete chrome.  
   Units: follow existing companion units prefs if distance/elevation display helpers exist; otherwise match web km/m for v1 of this glance.

6. **Query layer**  
   Keep `EVENTS_QUERY_KEY` + `useUpcomingEventsQuery`; add `useEventDetailQuery(id)` and richer `mapEventGlance` (meta line like web `formatEventMeta`). Prefetch detail on row press optional. Failures MUST NOT block Today hero (same pattern as other glances).

7. **Deep links**  
   Map `/events/:id` (and app scheme equivalent) to the new detail route when authenticated; list optional. Update `pathMap` / resolve helpers.

## Risks / Trade-offs

- **[Risk] List payload includes past events + all fields** → Mitigation: client filter/sort/cap; detail fetch only on open.
- **[Risk] Athletes without `goal:read` on older tokens** → Mitigation: silent omit section on 401/403; re-auth eventually picks up scope (already in `COMPANION_SCOPES`).
- **[Risk] Today scroll length** → Mitigation: hide when empty; cap 3; no nested cards beyond one section chrome.
- **[Risk] Location fields inconsistent (`location` vs city/country)** → Mitigation: mirror web: prefer `city, country`; fall back to `location`.
- **[Risk] Goals shape varies** → Mitigation: show title + optional target date/status only when present; never invent goals.

## Migration Plan

1. Extend events types/mappers/tests; add detail API + hooks.
2. Ship glance + list + detail routes; wire Today; remove chip + Coming up next-event line.
3. Deep-link + Open web handoff for manage.
4. Update `docs/product-baseline.md` Today IA line (events glance vs countdown chip).
5. Rollback: hide glance routes; restore chip if needed (feature is additive).

## Open Questions

- Exact Today order vs Coming up: **before Coming up** (proposed) vs after — confirm in implement if scroll feels long.
- Whether More should also link to Upcoming Events list (nice-to-have; Today See all is enough for v1).
- Distance/elevation unit conversion vs always km/m like web detail.
