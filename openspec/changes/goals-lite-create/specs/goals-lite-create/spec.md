## ADDED Requirements

### Requirement: Create goal entry points
The Goals hub SHALL offer a Create goal action from the list (and from the empty state when no goals exist).

#### Scenario: Open create from list
- **WHEN** the authenticated user is on Goals list and chooses Create / Add
- **THEN** the app opens the create-goal form

#### Scenario: Open create from empty state
- **WHEN** the Goals list is empty and the user chooses Create goal
- **THEN** the app opens the create-goal form (Manage on web MAY remain as a secondary action)

### Requirement: Create goal form
The create-goal form SHALL let the athlete pick a supported goal type (`BODY_COMPOSITION`, `EVENT`, `PERFORMANCE`, `CONSISTENCY`), enter a title, and enter type-appropriate minimum fields (including a target date when required for planning coherence). The form MUST validate required fields before calling the API.

#### Scenario: Valid create
- **WHEN** the user submits a valid create payload
- **THEN** the app calls Bearer `POST /api/goals` with `goal:write` and on success navigates to the new goal’s detail (or returns to an updated Goals list that includes the new goal)

#### Scenario: Validation failure
- **WHEN** required fields for the selected type are missing
- **THEN** the app blocks submit and shows field-level guidance without calling the API

#### Scenario: API failure
- **WHEN** create fails
- **THEN** the user sees an error and can retry; partial local draft MAY be retained in the form

### Requirement: Create does not replace web depth
Create-goal MUST NOT implement AI Suggest/Review or full web wizard fields. Goals list/detail SHALL continue to offer Manage on web for edit, delete, and AI tools.

#### Scenario: Manage on web still available
- **WHEN** the user needs edit, delete, or AI tools
- **THEN** Goals list or detail still offers Manage on web to `/profile/goals`
