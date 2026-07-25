## ADDED Requirements

### Requirement: Week target tuning
Plan → Training SHALL allow editing the current (or selected) week’s focus, volume, TSS target, and recovery-week flag via Bearer week PATCH when the athlete has an active plan.

#### Scenario: Save week tune
- **WHEN** the athlete changes week targets and saves successfully
- **THEN** Plan Training shows the updated week targets

#### Scenario: Week tune failure
- **WHEN** week PATCH fails
- **THEN** the athlete sees an error and prior values remain visible after refresh

### Requirement: Reschedule planned workout
Plan → Training SHALL allow moving a planned workout to another date via Bearer move API using a mobile date-selection flow (not a desktop drag-and-drop board).

#### Scenario: Move success
- **WHEN** the athlete picks a new date and move succeeds
- **THEN** the workout appears on the new date in Plan week and Upcoming after refresh

#### Scenario: Move conflict
- **WHEN** the server rejects the move
- **THEN** the app shows the failure and does not silently keep a local new date

### Requirement: Block structure CRUD lite
Plan → Training SHALL allow adding, reordering, renaming, retyping, and adjusting duration of training blocks via Bearer block APIs, presented as list/sheet editors suitable for touch.

#### Scenario: Reorder blocks
- **WHEN** the athlete reorders blocks and save succeeds
- **THEN** the season timeline / block list reflects the new order

#### Scenario: No desktop architect board
- **WHEN** the athlete edits structure on mobile
- **THEN** the UI uses mobile list/sheet patterns and MUST NOT require a PlanArchitectBoard-style canvas

### Requirement: Refresh after structure edits
Successful tune, move, or block edits SHALL refresh Plan Training and planned-workout lists used by Upcoming/Today teasers.

#### Scenario: Today coming-up after move
- **WHEN** a near-term workout is moved
- **THEN** Coming up / Upcoming reflect the change after refresh
