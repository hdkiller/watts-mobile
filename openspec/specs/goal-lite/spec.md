# goal-lite Specification

## Purpose
TBD - created by archiving change mobile-activation-onboarding. Update Purpose after archive.
## Requirements
### Requirement: Primary goal capture in activation
During activation, the app SHALL let the athlete create one primary goal using Coach Watts goal types supported by the API (at least event/race, performance, consistency, and body composition when the server accepts them), with the minimum fields required for plan initialize (including a target date when the type/API requires it).

#### Scenario: Create goal succeeds
- **WHEN** the user submits a valid primary goal during the goal wizard step
- **THEN** the app creates it via Bearer `POST /api/goals` with `goal:write` and advances when the server reflects a primary goal

#### Scenario: Validation failure
- **WHEN** required fields are missing for the selected type
- **THEN** the app blocks submit and shows field-level guidance without calling the API

### Requirement: Optional AI goal suggest
The goal step MAY offer an AI suggest action that loads server suggestions and lets the user accept one as the created goal. The app MUST NOT invent goals on-device when the suggest API is unavailable.

#### Scenario: Accept suggestion
- **WHEN** suggestions load and the user accepts one
- **THEN** the app creates that goal through the goals write API (or documented accept endpoint)

#### Scenario: Suggest unavailable
- **WHEN** suggest is not Bearer-available
- **THEN** the UI still allows manual goal capture without a fake suggest control

### Requirement: Ongoing goal lite edit
After activation, the app SHALL provide an ongoing Goals surface reachable from More → Goals (list + read-only detail) using `goal:read`. Athlete MAY show a compact primary-goal summary that navigates into the Goals hub or primary goal detail. Full goal create/edit/delete, multi-goal portfolio editing, and AI suggest/review panels MUST remain Open web for this capability (activation wizard create remains the native create path).

#### Scenario: Browse goals after activation
- **WHEN** a soft- or fully-activated athlete opens More → Goals
- **THEN** the app lists goals from Bearer `GET /api/goals` and allows opening read-only detail

#### Scenario: Athlete summary navigates to Goals
- **WHEN** the athlete views the Goal summary on Athlete and chooses it
- **THEN** the app navigates to the Goals hub or the primary goal detail (not an inline title editor)

#### Scenario: Deep goal tools stay on web
- **WHEN** the athlete needs to create, edit, delete, or run AI suggest/review on goals after activation
- **THEN** the surface offers Open web to `/profile/goals` rather than porting the full web goals suite

### Requirement: Goals selectable for plan generation
Athletes with existing goals SHALL be able to choose which goal drives plan initialize from the shared plan generator, using the same goal list available to goal lite (`GET /api/goals` / `goal:read`). Creating a missing goal SHALL reuse the existing goal-lite create surface rather than a nested full EventGoalWizard inside the generator.

#### Scenario: Select existing goal for plan
- **WHEN** the athlete opens plan generation with one or more goals already created
- **THEN** those goals appear as selectable options bound to initialize `goalId`

#### Scenario: Create goal from generator empty state
- **WHEN** the athlete has no goals and taps Create goal from the generator
- **THEN** the app opens the existing goal create flow and, after a successful create, the new goal can be selected for initialize

