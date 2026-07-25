## ADDED Requirements

### Requirement: Create plan wires generator
When no active plan exists, the Plan → Training Create plan affordance SHALL open the shared plan generator flow and on successful activate SHALL return to Plan → Training showing the active plan.

#### Scenario: Create completes
- **WHEN** the athlete finishes generate → preview → activate from Plan
- **THEN** Plan → Training shows the new active plan without requiring the activation wizard

### Requirement: Generation progress on Training
While block/week/structure generation jobs started from Plan are in progress, the Training segment SHALL show honest in-progress UI and refresh when jobs complete or fail.

#### Scenario: Job failure visible
- **WHEN** a generate job fails
- **THEN** the athlete sees failure copy and can retry or Open web
