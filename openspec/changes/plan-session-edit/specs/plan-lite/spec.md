## ADDED Requirements

### Requirement: Plan is editable at session granularity
Beyond week tuning, block editing, and replanning, an active plan SHALL be adjustable one session at a time — the athlete can add, edit, and delete an individual planned workout on device via the `plan-session-edit` capability, without a web handoff.

#### Scenario: Real-world deviation handled on device
- **WHEN** the athlete needs to add an unplanned session, shorten one, or remove a duplicate
- **THEN** they can do so from the Plan tab rather than opening the web app

#### Scenario: Season-level tools unchanged
- **WHEN** the athlete tunes a week, edits blocks, or replans structure after this change
- **THEN** those flows behave as before
