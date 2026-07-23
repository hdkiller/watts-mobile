## MODIFIED Requirements

### Requirement: Upcoming events list
The system SHALL show upcoming race/life events via `GET /api/events` with Bearer `goal:read`, filtering to events on or after the athlete’s local today, sorted soonest-first. A dedicated Upcoming Events list screen SHALL be reachable from Today’s Upcoming Events glance (“See all”) **and** from More → Events.

#### Scenario: List loads
- **WHEN** the authenticated user opens Upcoming Events
- **THEN** they see upcoming events with date, title, and type/location meta when available, plus a days-until countdown

#### Scenario: Open Events from More
- **WHEN** the authenticated user opens More and chooses Events
- **THEN** the app navigates to the Upcoming Events list screen

#### Scenario: Empty list
- **WHEN** the API returns no upcoming events (after filtering past dates)
- **THEN** the user sees an honest empty state

#### Scenario: Past events excluded
- **WHEN** the events API includes past-dated events
- **THEN** the list and glance MUST NOT show those past events

### Requirement: Manage events on web only
The companion MUST NOT offer create, edit, or delete for events. Detail, empty, and More-hub manage affordances SHALL provide Open web to `/events` or `/events/:id` via the existing instance session-handoff helper when available.

#### Scenario: Open web from detail
- **WHEN** the user chooses Open web on event detail
- **THEN** the app opens the instance events URL for that event (handoff when available)

#### Scenario: Open web from Events list
- **WHEN** the user chooses Manage on web from the Events list empty or manage affordance
- **THEN** the app opens the instance `/events` area (handoff when available)
