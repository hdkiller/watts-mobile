# plan-lite Specification

## Purpose
TBD - created by archiving change mobile-activation-onboarding. Update Purpose after archive.
## Requirements
### Requirement: Plan lite inputs
The plan lite wizard SHALL collect the minimum inputs needed to initialize a plan: weekly availability (training days and/or hours), volume preference (LOW / MID / HIGH or equivalent), and preferred activity types from a small curated set. It MUST NOT expose full PlanDashboard strategy grids, block editors, or adaptation wizards.

#### Scenario: Minimal inputs collected
- **WHEN** the athlete completes the plan lite form
- **THEN** the app has availability, volume preference, and at least one preferred activity type before calling initialize

### Requirement: Initialize and preview
The app SHALL create a draft plan via Bearer `POST /api/plans/initialize` (or documented successor) using `plan:write`, then present a first-week (or near-term) preview of planned workouts before activation.

#### Scenario: Initialize success
- **WHEN** initialize succeeds
- **THEN** the athlete sees a readable preview of upcoming planned sessions derived from the returned or refreshed plan

#### Scenario: Initialize in progress
- **WHEN** initialize is slow or job-based
- **THEN** the UI shows progress/waiting and does not navigate away as if the plan were activated

#### Scenario: Initialize failure
- **WHEN** initialize fails
- **THEN** the athlete can retry or use Open web without the app marking plan activation complete

### Requirement: Activate plan
The app SHALL activate the draft plan via Bearer activate API with `plan:write` after the athlete confirms the preview. Full replan, abandon, adapt, and structure tools remain out of scope (Open web).

#### Scenario: Activate success
- **WHEN** the athlete confirms activate and the API succeeds
- **THEN** the plan is active server-side and the wizard can proceed to first insight

#### Scenario: Deep plan tools stay on web
- **WHEN** the athlete needs adaptation, replan-structure, or PlanDashboard editing
- **THEN** the app offers Open web rather than native architect UI

### Requirement: Provisional plan honesty
When a plan is activated before usable training/wellness data exists, plan lite and subsequent insight copy SHALL indicate the plan is provisional and may improve after connecting data.

#### Scenario: No data yet
- **WHEN** plan activates and the athlete has no usable imported/synced data
- **THEN** preview/insight messaging states coaching improves after Health Sync or a connected app

