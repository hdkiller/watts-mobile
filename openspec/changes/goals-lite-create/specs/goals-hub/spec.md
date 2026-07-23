## MODIFIED Requirements

### Requirement: Goal detail (read-only)
Tapping a goal row SHALL open an in-app goal detail screen that shows available fields (title, type, priority, description, target/start/current values when present, status, target date) and linked events when present. Detail MUST NOT offer native edit or delete controls. Native create remains on the Goals list / empty state, not on detail.

#### Scenario: Open goal detail
- **WHEN** the user taps a goal row
- **THEN** the app navigates to that goal’s detail and shows at least title and type

#### Scenario: Linked events on goal detail
- **WHEN** the goal includes linked events with ids
- **THEN** the user can open the matching in-app event detail when an event id is available

### Requirement: Manage goals on web
Goals list and detail SHALL offer Open web to `/profile/goals` (or the goal’s web path when known) via the instance session-handoff helper when available, for edit/delete and AI tools. Create MAY be done in-app; Manage on web MUST remain for depth beyond lite create.

#### Scenario: Open web from Goals
- **WHEN** the user chooses Manage on web / Open web from Goals list or detail
- **THEN** the system browser opens the instance goals area with handoff when available

## ADDED Requirements

### Requirement: Create from Goals hub
The Goals list and empty state SHALL expose a Create goal action that opens the in-app create-goal flow (`goals-lite-create`).

#### Scenario: Add visible on list
- **WHEN** the authenticated user views Goals list (empty or non-empty)
- **THEN** a Create / Add affordance is available without requiring Open web
