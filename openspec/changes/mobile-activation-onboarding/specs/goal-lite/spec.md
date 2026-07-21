## ADDED Requirements

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
After activation, the app SHALL provide a lite surface to view and edit the primary goal (More → Athlete subsection or a dedicated Goals entry) using `goal:read` / `goal:write`. Full goal analytics, multi-goal portfolio management, and AI review panels MAY remain Open web.

#### Scenario: Edit primary goal
- **WHEN** a soft- or fully-activated athlete opens goal lite edit and saves changes
- **THEN** the app PATCHes the goal via Bearer and refreshes displayed goal summary

#### Scenario: Deep goal tools stay on web
- **WHEN** the athlete needs full goal review / portfolio tools beyond lite edit
- **THEN** the surface offers Open web rather than porting the full web goals suite
