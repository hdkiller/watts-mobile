## MODIFIED Requirements

### Requirement: Ongoing goal lite edit
After activation, the app SHALL provide Goals hub browse/detail plus native **create** of additional goals via Bearer `goal:write`. Primary-goal summary on Athlete MAY navigate into Goals. Full goal analytics, multi-goal edit/delete portfolio tools, and AI review panels MUST remain Open web (not required as native edit in this capability).

#### Scenario: Create additional goal after activation
- **WHEN** a soft- or fully-activated athlete opens Goals and completes Create goal
- **THEN** the app creates the goal via Bearer `POST /api/goals` and the new goal appears in the Goals hub

#### Scenario: Deep goal tools stay on web
- **WHEN** the athlete needs edit, delete, AI review, or portfolio tools beyond lite create
- **THEN** the surface offers Open web rather than porting the full web goals suite
