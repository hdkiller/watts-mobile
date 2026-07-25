## MODIFIED Requirements

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
