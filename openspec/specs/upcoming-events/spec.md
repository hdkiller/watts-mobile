# upcoming-events Specification

## Purpose
TBD - created by archiving change today-upcoming-races. Update Purpose after archive.
## Requirements
### Requirement: Upcoming events list
The system SHALL show upcoming race/life events via `GET /api/events` with Bearer `goal:read`, filtering to events on or after the athlete’s local today, sorted soonest-first. A dedicated Upcoming Events list screen SHALL be reachable from Today’s Upcoming Events glance (“See all”).

#### Scenario: List loads
- **WHEN** the authenticated user opens Upcoming Events
- **THEN** they see upcoming events with date, title, and type/location meta when available, plus a days-until countdown

#### Scenario: Empty list
- **WHEN** the API returns no upcoming events (after filtering past dates)
- **THEN** the user sees an honest empty state

#### Scenario: Past events excluded
- **WHEN** the events API includes past-dated events
- **THEN** the list and glance MUST NOT show those past events

### Requirement: Open lite event detail
Tapping an upcoming event row SHALL open a read-only in-app event detail screen loaded via `GET /api/events/:id` with Bearer `goal:read`.

#### Scenario: Open event detail
- **WHEN** the user taps an upcoming event row
- **THEN** the app navigates to that event’s detail screen and shows title and date

#### Scenario: Detail stats when present
- **WHEN** the event payload includes distance, elevation, and/or location fields
- **THEN** the detail screen shows corresponding summary tiles and MUST omit tiles for missing values

#### Scenario: Priority and type
- **WHEN** the event has type/subType and/or priority
- **THEN** the detail screen shows type (and subType when present) and a priority indicator when priority is present

#### Scenario: Description and start time
- **WHEN** description and/or startTime are present
- **THEN** the detail screen shows those fields

#### Scenario: Linked goals
- **WHEN** the event detail includes linked goals
- **THEN** the screen shows a compact linked-goals section with goal titles (and target/status when available)

### Requirement: Manage events on web only
The companion MUST NOT offer create, edit, or delete for events. Detail (and empty/manage affordances) SHALL provide Open web to `/events` or `/events/:id` via the existing instance session-handoff helper when available.

#### Scenario: Open web from detail
- **WHEN** the user chooses Open web on event detail
- **THEN** the app opens the instance events URL for that event (handoff when available)

### Requirement: Events failures do not block Today
Loading or failure of the events list or detail query MUST NOT block rendering of the Today recommendation hero, planned workout, or primary CTAs.

#### Scenario: Events list fails on Today
- **WHEN** `GET /api/events` errors while Today is open
- **THEN** the Upcoming Events glance is omitted or shows a quiet failure and the rest of Today remains usable

### Requirement: No calendar heatmap
Upcoming Events SHALL be a list (or simple day-ordered list), not a calendar heatmap or multi-month browser.

#### Scenario: List not calendar
- **WHEN** the user opens Upcoming Events
- **THEN** they see a list UI without a heatmap calendar

