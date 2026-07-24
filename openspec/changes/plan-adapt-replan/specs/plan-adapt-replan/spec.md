## ADDED Requirements

### Requirement: Adapt remaining week
When an active plan exists, Plan → Training SHALL offer a confirm-gated Adapt action to recalculate the remaining week via Bearer `POST /api/plans/adapt` (or documented successor) with the recalculate action type.

#### Scenario: Recalculate confirm
- **WHEN** the athlete confirms Recalculate Remaining Week
- **THEN** the app calls the adapt API and shows progress until success or failure

### Requirement: Push schedule forward
Plan → Training SHALL offer a confirm-gated Adapt action to push the schedule forward one day via the adapt API push action type.

#### Scenario: Push forward confirm
- **WHEN** the athlete confirms Push Schedule Forward 1 Day
- **THEN** the app calls the adapt API and refreshes plan/planned lists on success

### Requirement: Replan structure
When the server supports it, Plan → Training SHALL offer confirm-gated replan structure for the active plan and MUST show progress/failure honesty for job-based replans.

#### Scenario: Replan unavailable
- **WHEN** replan-structure is not Bearer-ready
- **THEN** the app MUST NOT show a dead control that pretends to replan; omit or Open web with honest copy

#### Scenario: Replan success
- **WHEN** replan succeeds
- **THEN** Plan Training refreshes to the updated structure/workouts

### Requirement: Abandon plan
Plan → Training SHALL offer abandon with a destructive confirmation. On success the Training segment SHALL show the empty/create state.

#### Scenario: Abandon confirmed
- **WHEN** the athlete confirms abandon and the API succeeds
- **THEN** there is no active plan in the Training shell and Create plan is available

### Requirement: Start new plan
Plan → Training SHALL offer Start new plan that clears or abandons the active plan as required by the server, then opens the shared plan generator.

#### Scenario: Start new opens generator
- **WHEN** the athlete chooses Start new and confirms any required abandon step
- **THEN** the shared generator flow opens for a new plan

### Requirement: Query refresh after disruption actions
After successful adapt, replan, or abandon, the app SHALL invalidate or refetch Plan, planned-workouts, and Today-related planned queries so other surfaces do not show stale schedule data.

#### Scenario: Upcoming reflects push forward
- **WHEN** push forward succeeds
- **THEN** More → Upcoming and Plan week lists reflect the shifted dates after refresh
