## ADDED Requirements

### Requirement: Goals selectable for plan generation
Athletes with existing goals SHALL be able to choose which goal drives plan initialize from the shared plan generator, using the same goal list available to goal lite (`GET /api/goals` / `goal:read`). Creating a missing goal SHALL reuse the existing goal-lite create surface rather than a nested full EventGoalWizard inside the generator.

#### Scenario: Select existing goal for plan
- **WHEN** the athlete opens plan generation with one or more goals already created
- **THEN** those goals appear as selectable options bound to initialize `goalId`

#### Scenario: Create goal from generator empty state
- **WHEN** the athlete has no goals and taps Create goal from the generator
- **THEN** the app opens the existing goal create flow and, after a successful create, the new goal can be selected for initialize
