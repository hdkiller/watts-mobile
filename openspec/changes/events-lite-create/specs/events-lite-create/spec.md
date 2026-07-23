## ADDED Requirements

### Requirement: Create event entry points
The Upcoming Events list SHALL offer a Create event action from the list (and from the empty state when no upcoming events exist).

#### Scenario: Open create from list
- **WHEN** the authenticated user is on Upcoming Events and chooses Create / Add
- **THEN** the app opens the create-event form

#### Scenario: Open create from empty state
- **WHEN** the Events list is empty and the user chooses Create event
- **THEN** the app opens the create-event form (Manage on web MAY remain as a secondary action)

### Requirement: Create event form
The create-event form SHALL collect at least title and date, plus lite optional fields used by the companion (type, priority A/B/C, location, description, start time when offered). The form MUST validate required fields before calling the API.

#### Scenario: Valid create
- **WHEN** the user submits a valid create payload
- **THEN** the app calls Bearer `POST /api/events` with the documented write scope and on success navigates to the new event’s detail

#### Scenario: Validation failure
- **WHEN** title or date is missing
- **THEN** the app blocks submit and shows field-level guidance without calling the API

#### Scenario: API failure
- **WHEN** create fails
- **THEN** the user sees an error and can retry; form values MAY be retained

### Requirement: Create does not replace web depth
Create-event MUST NOT implement full EventForm parity (advanced race metadata editors, Intervals sync controls, public/virtual portfolio tools). Events list/detail SHALL continue to offer Manage on web for edit, delete, and advanced fields.

#### Scenario: Manage on web still available
- **WHEN** the user needs edit, delete, or advanced event fields
- **THEN** Events list or detail still offers Manage on web to `/events` or `/events/:id`
