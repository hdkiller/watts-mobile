# plan-generator Specification

## Purpose
TBD - created by archiving change plan-generator-full. Update Purpose after archive.
## Requirements
### Requirement: Shared generator module
The app SHALL provide a single training plan generator module used by the activation plan step and by Plan tab create/regenerate entry points. The module SHALL collect minimum inputs (availability, volume preference, preferred activity types) and MAY collect additional strategy fields when required by the initialize API.

#### Scenario: Activation uses shared module
- **WHEN** the athlete reaches the activation plan step
- **THEN** initialize/preview/activate run through the shared generator module

#### Scenario: Plan tab create uses shared module
- **WHEN** the athlete chooses Create plan on Plan → Training with no active plan
- **THEN** the same generator flow runs and returns them to Plan Training on success

### Requirement: Initialize and preview
The generator SHALL create a draft via Bearer `POST /api/plans/initialize` (or documented successor) with `plan:write`, then present a first-week (or near-term) preview before activation.

#### Scenario: Initialize success shows preview
- **WHEN** initialize succeeds
- **THEN** the athlete sees a readable preview of upcoming planned sessions before activate

#### Scenario: Initialize in progress
- **WHEN** initialize or preview generation is job-based and slow
- **THEN** the UI shows progress/waiting and does not treat the plan as activated

#### Scenario: Initialize failure
- **WHEN** initialize fails
- **THEN** the athlete can retry or Open web without marking plan activation complete

### Requirement: Activate plan
The generator SHALL activate the draft via Bearer activate API after confirm. On success from Plan tab, Training shell SHALL refresh to the active plan. On success from activation, the wizard SHALL proceed to first insight.

#### Scenario: Activate from Plan tab
- **WHEN** the athlete confirms activate on Plan create flow and the API succeeds
- **THEN** the plan is active server-side and Plan → Training shows the active plan shell

### Requirement: Post-activate week and structure generation
For an active plan, the generator SHALL allow triggering workout generation for a block or week (`generate-block` / `generate-ai-week` as documented) and structured-workout generation for planned workouts missing structure, with progress and failure honesty.

#### Scenario: Generate structure for a workout
- **WHEN** a planned workout lacks structure and the athlete requests generate structure
- **THEN** the app starts the Bearer generate-structure flow and updates the UI when structure becomes available or the job fails

#### Scenario: Week generation in progress
- **WHEN** week/block generation is running
- **THEN** Plan Training shows in-progress state and does not imply completion until refresh shows workouts or the job fails

### Requirement: Provisional plan honesty
When a plan is activated before usable training/wellness data exists, generator and Plan copy SHALL indicate the plan is provisional and may improve after connecting data.

#### Scenario: No data yet
- **WHEN** plan activates and the athlete has no usable imported/synced data
- **THEN** preview/Plan messaging states coaching improves after Health Sync or a connected app

### Requirement: Web leftovers remain web
The generator MUST NOT implement plan templates, public share, or Intervals publish; those SHALL remain Open web.

#### Scenario: No native template library
- **WHEN** the athlete wants to start from a saved template library
- **THEN** the app offers Open web rather than a native template browser

### Requirement: Generator available after abandon
After a successful abandon (or clear active plan), the shared plan generator SHALL be reachable from Plan → Training Create / Start new without requiring the activation wizard.

#### Scenario: Start new after abandon
- **WHEN** the athlete abandons and chooses Start new / Create
- **THEN** the shared generator flow runs for a new draft plan

