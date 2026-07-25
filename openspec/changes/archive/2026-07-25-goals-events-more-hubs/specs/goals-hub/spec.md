## ADDED Requirements

### Requirement: Goals entry from More
The More tab SHALL provide a Goals entry that opens an in-app Goals list screen.

#### Scenario: Open Goals from More
- **WHEN** the authenticated user opens More and chooses Goals
- **THEN** the app navigates to the Goals list screen

### Requirement: Goals list
The Goals list SHALL load goals via `GET /api/goals` with Bearer `goal:read` and show each goal’s title and type (and target date when present), soonest/primary-friendly ordering as returned or sorted by target date when available.

#### Scenario: List loads
- **WHEN** goals are available
- **THEN** the user sees one row per goal with title and type

#### Scenario: Empty list
- **WHEN** the API returns no goals
- **THEN** the user sees an honest empty state and an Open web action to `/profile/goals`

#### Scenario: Load error
- **WHEN** the goals request fails
- **THEN** the user sees an error and can retry

### Requirement: Goal detail (read-only)
Tapping a goal row SHALL open an in-app goal detail screen that shows available fields (title, type, priority, description, target/start/current values when present, status, target date) and linked events when present. Detail MUST NOT offer native create/edit/delete controls.

#### Scenario: Open goal detail
- **WHEN** the user taps a goal row
- **THEN** the app navigates to that goal’s detail and shows at least title and type

#### Scenario: Linked events on goal detail
- **WHEN** the goal includes linked events with ids
- **THEN** the user can open the matching in-app event detail when an event id is available

### Requirement: Manage goals on web
Goals list and detail SHALL offer Open web to `/profile/goals` (or the goal’s web path when known) via the instance session-handoff helper when available, for create/edit/delete and AI tools.

#### Scenario: Open web from Goals
- **WHEN** the user chooses Manage on web / Open web from Goals list or detail
- **THEN** the system browser opens the instance goals area with handoff when available
