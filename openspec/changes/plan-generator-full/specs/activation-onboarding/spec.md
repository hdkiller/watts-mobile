## ADDED Requirements

### Requirement: Activation plan step hosts shared generator
The activation wizard plan step SHALL host the shared `plan-generator` module for inputs → initialize → preview → activate, then continue to first insight on success.

#### Scenario: Plan step completes via shared module
- **WHEN** the athlete completes the activation plan step successfully
- **THEN** soft-activation plan criteria can be satisfied and the wizard proceeds to first insight
