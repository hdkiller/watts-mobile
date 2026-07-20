## ADDED Requirements

### Requirement: Fueling prep glance when nutrition enabled
When the athlete profile has nutrition tracking enabled, the planned workout detail screen SHALL load fueling prep for that planned workout via the Bearer-capable fueling endpoint (coach-wattz `GET /api/workouts/planned/:id/fueling` or documented equivalent with `nutrition:read` / agreed scope) and show a compact read-only glance when a fueling plan is present.

#### Scenario: Prep present
- **WHEN** nutrition tracking is enabled and the fueling API returns a non-null plan with displayable targets
- **THEN** the planned detail shows a Fueling prep section with those compact targets/labels

#### Scenario: Tracking disabled
- **WHEN** nutrition tracking is disabled
- **THEN** the planned detail does not fetch or show fueling prep

#### Scenario: Plan null or error
- **WHEN** nutrition tracking is enabled but the fueling plan is null or the request fails
- **THEN** the detail omits the glance or shows an honest empty/error state without inventing carb/calorie targets

### Requirement: No strategy override on mobile
The fueling prep glance MUST NOT let the user change fueling strategy or edit the fueling plan in-app; deeper prep remains Open web or Log for meal writes.

#### Scenario: Read-only prep
- **WHEN** the user views fueling prep on planned detail
- **THEN** there is no control to override strategy or edit prep targets on that screen
