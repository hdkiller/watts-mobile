# nutrition-quick-log Specification

## Purpose
TBD - created by archiving change phase-4-nutrition-quick-log. Update Purpose after archive.
## Requirements
### Requirement: Nutrition entry on Log
The system SHALL expose nutrition quick-log UI on the Log tab (inline section or Log stack screen), not as a fifth primary tab.

#### Scenario: Reach nutrition from Log
- **WHEN** the authenticated user opens Log
- **THEN** they can reach today’s nutrition totals and quick-log actions

### Requirement: Today nutrition totals
The system SHALL load today’s nutrition summary via `GET /api/nutrition` (or equivalent date-scoped read) with Bearer `nutrition:read` and display calorie/macro totals when available.

#### Scenario: Totals load
- **WHEN** today’s nutrition data is available
- **THEN** the user sees at least calorie total and available macro totals (protein, carbs, fat)

#### Scenario: Empty day
- **WHEN** there is no nutrition log for today
- **THEN** the user sees an honest empty/zero state suitable for first log

### Requirement: Quick-log meal or macros
The system SHALL let the user append a nutrition item (meal slot and/or macros) via `POST /api/nutrition` with Bearer `nutrition:write`.

#### Scenario: Successful item log
- **WHEN** the user submits a valid quick-log entry
- **THEN** the client saves to the server and refreshes today’s totals

#### Scenario: Save error
- **WHEN** the save fails
- **THEN** the user sees an error and can retry

### Requirement: Hydration quick-add
The system SHALL provide a hydration quick-add action that records water volume for today using a Bearer-capable nutrition API path.

#### Scenario: Add water
- **WHEN** the user quick-adds a hydration volume and the request succeeds
- **THEN** today’s hydration total updates in the UI

### Requirement: Web escape for nutrition planning
Nutrition quick-log SHALL offer Open web for meal planning, grocery, or deeper nutrition tools rather than porting those surfaces.

#### Scenario: Open web from nutrition
- **WHEN** the user chooses Open web from the nutrition surface
- **THEN** the system browser opens the configured instance nutrition area when known, otherwise instance home

### Requirement: No nutrition planning on device
The nutrition surface MUST NOT include meal-plan generation or grocery-list editing.

#### Scenario: No plan generate
- **WHEN** the user uses nutrition quick-log
- **THEN** there is no in-app control to generate a meal plan or edit grocery lists

