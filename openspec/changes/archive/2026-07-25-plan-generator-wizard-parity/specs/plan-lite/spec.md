## ADDED Requirements

### Requirement: Goal selection before initialize
The shared plan generator SHALL require an explicit selected goal before initialize. It SHALL list the athlete’s existing goals (from `goal:read` / `GET /api/goals`) and let the athlete choose one. When exactly one goal exists, the generator MAY auto-select it. When multiple exist, the generator SHALL default to the host-provided goal id or the primary goal ordering used elsewhere in the app, and MUST let the athlete change the selection. When no goals exist, the generator MUST block initialize and offer Create goal via the existing goal-lite create surface.

#### Scenario: Multi-goal athlete picks a goal
- **WHEN** the athlete has more than one goal and opens plan create or the activation plan step
- **THEN** the generator shows a selectable goal list and uses the chosen `goalId` on initialize

#### Scenario: No goals blocks generate
- **WHEN** the athlete has zero goals
- **THEN** Generate/initialize stays disabled until a goal exists, with a path to create one

#### Scenario: Single goal auto-selected
- **WHEN** the athlete has exactly one goal
- **THEN** that goal is selected by default and shown as the bound goal before initialize

### Requirement: Plan calendar on initialize
The generator SHALL collect a plan start date and an end date (directly or via duration weeks from start) and SHALL send both `startDate` and `endDate` on Bearer `POST /api/plans/initialize` when an end date can be determined. When the selected goal has a target/event date, the generator MAY default end date from that goal.

#### Scenario: End date sent from goal target
- **WHEN** the selected goal has a usable target or event date and the athlete keeps From goal mode
- **THEN** initialize includes that date as `endDate`

#### Scenario: Duration mode
- **WHEN** the athlete chooses a duration of N weeks (N ≥ 4)
- **THEN** initialize sends `endDate` computed from the chosen start date plus N weeks

#### Scenario: Missing end blocked
- **WHEN** neither a goal date nor a duration provides an end date
- **THEN** the app blocks initialize and explains that a target date or duration is required

### Requirement: Activate uses initialize start
After preview confirm, the generator SHALL call activate with the same plan start date used for initialize (Bearer activate body `startDate` when the API accepts it).

#### Scenario: Activate carries startDate
- **WHEN** the athlete confirms activate
- **THEN** the activate request includes the initialize start date rather than an empty body that silently defaults server-side

### Requirement: Phase glance before activate
After initialize succeeds, the preview SHALL show a compact read-only list of plan blocks/phases (name and duration or dates when present) in addition to the first-week workout preview. The generator MUST NOT offer native block editing in this flow.

#### Scenario: Blocks visible on preview
- **WHEN** initialize returns plan blocks
- **THEN** the athlete sees those phases before confirming activate

## MODIFIED Requirements

### Requirement: Plan lite inputs
The plan lite wizard SHALL collect the minimum inputs needed to initialize a plan: a selected goal, weekly availability (training days and/or hours), volume preference (LOW / MID / HIGH or equivalent), preferred activity types from a small curated set, and plan calendar (start and end/duration). Advanced strategy fields MAY be collected when required by the initialize API. It MUST NOT expose full PlanDashboard strategy grids, block editors, or adaptation wizards.

#### Scenario: Minimal inputs collected
- **WHEN** the athlete completes the plan lite form
- **THEN** the app has a selected goal, availability, volume preference, at least one preferred activity type, and a resolvable end date before calling initialize

### Requirement: Initialize and preview
The app SHALL create a draft plan via Bearer `POST /api/plans/initialize` (or documented successor) using `plan:write`, then present a phase glance and a first-week (or near-term) preview of planned workouts before activation.

#### Scenario: Initialize success
- **WHEN** initialize succeeds
- **THEN** the athlete sees a readable preview of plan phases and upcoming planned sessions derived from the returned or refreshed plan

#### Scenario: Initialize in progress
- **WHEN** initialize is slow or job-based
- **THEN** the UI shows progress/waiting and does not navigate away as if the plan were activated

#### Scenario: Initialize failure
- **WHEN** initialize fails
- **THEN** the athlete can retry or use Open web without the app marking plan activation complete

### Requirement: Activate plan
The app SHALL activate the draft plan via Bearer activate API with `plan:write` after the athlete confirms the preview, including the initialize start date when supported. Full replan, abandon, adapt, anchor multi-select, and structure tools remain out of scope for this surface (Open web or follow-on changes).

#### Scenario: Activate success
- **WHEN** the athlete confirms activate and the API succeeds
- **THEN** the plan is active server-side and the wizard can proceed to first insight (activation) or Plan Training (Plan tab)

#### Scenario: Deep plan tools stay on web
- **WHEN** the athlete needs adaptation, replan-structure, templates, or PlanDashboard editing
- **THEN** the app offers Open web rather than native architect UI
