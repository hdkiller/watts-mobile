## ADDED Requirements

### Requirement: Fetch upcoming events with Bearer
The client SHALL load the athlete’s race/life events via `GET /api/events` using the authenticated API client and the confirmed read scope (prefer `goal:read` once coach-wattz authorizes that endpoint for Bearer).

#### Scenario: Authorized fetch
- **WHEN** a valid access token exists with the required event-read scope
- **THEN** the events query calls `/api/events` with `Authorization: Bearer`

#### Scenario: Empty events
- **WHEN** the API returns an empty list
- **THEN** the client treats that as no upcoming events (no fabricated races)

### Requirement: Map events for field glance
The client SHALL map event payloads into a stable glance model with at least id, title, date, and optional type/priority when present, and SHALL compute a whole-day countdown relative to the athlete’s local calendar date.

#### Scenario: Countdown days
- **WHEN** an event date is in the future relative to local today
- **THEN** the view model exposes a non-negative days-until value suitable for “N days” copy

#### Scenario: Past events excluded from upcoming glance
- **WHEN** an event date is before local today
- **THEN** it is omitted from upcoming glance lists and countdown selection

### Requirement: No event authoring in companion
The companion SHALL NOT create, edit, or delete events in-app; deeper event management MUST use Open web.

#### Scenario: Open web for events depth
- **WHEN** the user needs to add or edit a race/life event
- **THEN** the app offers Open web (or equivalent) rather than an in-app event form
