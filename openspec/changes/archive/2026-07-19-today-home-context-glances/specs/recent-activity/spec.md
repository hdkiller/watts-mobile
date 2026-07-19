## ADDED Requirements

### Requirement: Today Recently entry point
Recent activity SHALL be reachable from a thin Recently teaser on the Today tab that reuses the same recent-activity query (`GET /api/workouts` with Bearer `workout:read`) and deep-links “See all” into the existing Recent activity list screen.

#### Scenario: See all from Today
- **WHEN** the user taps See all on Today’s Recently teaser
- **THEN** the app navigates to the Recent activity list screen

#### Scenario: Shared query cache
- **WHEN** Today loads the Recently teaser
- **THEN** it uses the same recent-activity query key/contract as the Recent activity screen (no separate invent endpoint)
