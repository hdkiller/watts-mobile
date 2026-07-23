## MODIFIED Requirements

### Requirement: Manage events on web only
The companion MUST NOT offer native **edit** or **delete** for events in this capability. Detail, empty, and list manage affordances SHALL provide Open web to `/events` or `/events/:id` via the existing instance session-handoff helper when available. Native **create** is allowed via `events-lite-create`.

#### Scenario: Open web from detail
- **WHEN** the user chooses Manage on web on event detail
- **THEN** the app opens the instance events URL for that event (handoff when available)

#### Scenario: Open web from Events list
- **WHEN** the user chooses Manage on web from the Events list empty or manage affordance
- **THEN** the app opens the instance `/events` area (handoff when available)

#### Scenario: Create is in-app
- **WHEN** the user chooses Create event from the Events list or empty state
- **THEN** the app opens the native create-event form rather than requiring Open web for create

## ADDED Requirements

### Requirement: Create from Events hub
The Upcoming Events list and empty state SHALL expose a Create event action that opens the in-app create-event flow (`events-lite-create`).

#### Scenario: Add visible on list
- **WHEN** the authenticated user views Upcoming Events (empty or non-empty)
- **THEN** a Create / Add affordance is available without requiring Open web
