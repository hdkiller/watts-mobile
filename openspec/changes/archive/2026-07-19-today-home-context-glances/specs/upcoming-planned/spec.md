## ADDED Requirements

### Requirement: Today Coming up entry point
Upcoming planned workouts SHALL be reachable from a thin Coming up teaser on the Today tab that reuses the same upcoming planned query (`GET /api/planned-workouts` with Bearer `workout:read`) and deep-links “See all” into the existing Upcoming list screen.

#### Scenario: See all from Today
- **WHEN** the user taps See all on Today’s Coming up strip
- **THEN** the app navigates to the Upcoming planned list screen

#### Scenario: Shared query cache
- **WHEN** Today loads the Coming up teaser
- **THEN** it uses the same upcoming-planned query key/contract as the Upcoming screen (no separate invent endpoint)
