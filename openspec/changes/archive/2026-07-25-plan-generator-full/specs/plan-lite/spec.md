## MODIFIED Requirements

### Requirement: Plan lite inputs
The activation plan step SHALL collect the minimum inputs needed to initialize a plan via the shared `plan-generator` module: weekly availability (training days and/or hours), volume preference (LOW / MID / HIGH or equivalent), and preferred activity types from a small curated set. Advanced strategy fields MAY be collected when required by the initialize API. Desktop-only template libraries and Intervals publish remain out of scope.

#### Scenario: Minimal inputs collected
- **WHEN** the athlete completes the activation plan form
- **THEN** the app has availability, volume preference, and at least one preferred activity type before calling initialize

### Requirement: Initialize and preview
The activation plan step SHALL create a draft plan via the shared generator’s Bearer `POST /api/plans/initialize` path, then present a first-week (or near-term) preview before activation.

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
The activation plan step SHALL activate the draft plan via the shared generator’s Bearer activate API after the athlete confirms the preview. Ongoing regenerate/adapt/replan after activation live on the Plan tab (follow-on changes); templates/share/Intervals publish remain Open web.

#### Scenario: Activate success
- **WHEN** the athlete confirms activate and the API succeeds
- **THEN** the plan is active server-side and the wizard can proceed to first insight

#### Scenario: Deep leftover tools stay on web
- **WHEN** the athlete needs plan templates, public share, or Intervals publish
- **THEN** the app offers Open web rather than native leftover UI

### Requirement: Provisional plan honesty
When a plan is activated before usable training/wellness data exists, plan lite / generator and subsequent insight copy SHALL indicate the plan is provisional and may improve after connecting data.

#### Scenario: No data yet
- **WHEN** plan activates and the athlete has no usable imported/synced data
- **THEN** preview/insight messaging states coaching improves after Health Sync or a connected app
