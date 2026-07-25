## ADDED Requirements

### Requirement: Captured items remain correctable
Quick-log SHALL remain the capture path for new intake, and an item captured through it MUST NOT be terminal — the day surface SHALL expose edit and delete for previously logged items via the `nutrition-log-editing` capability.

#### Scenario: Correct a just-logged item
- **WHEN** the athlete logs a meal via quick-log and then notices a wrong macro
- **THEN** they can edit that item on device without leaving the app for web

#### Scenario: Capture flow unchanged
- **WHEN** the athlete logs a new meal
- **THEN** the compose form behaves as before this change
