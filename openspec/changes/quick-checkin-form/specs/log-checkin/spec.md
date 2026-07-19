# log-checkin Delta — Quick Check-in Form

## MODIFIED Requirements

### Requirement: Log check-in form
The Log tab SHALL present a form for feel/readiness, sleep duration, sleep quality, optional notes, and optional weight for the athlete's local today. Readiness (1–10) and sleep quality (1–5) SHALL be selectable by tapping value chips without opening a keyboard; sleep hours SHALL support both stepper adjustment (±0.5h) and direct numeric entry. The weight field SHALL display the athlete profile's weight unit when available, defaulting to kg.

#### Scenario: Form fields visible
- **WHEN** the authenticated user opens Log
- **THEN** they can enter readiness, sleep hours, sleep quality, notes, and weight

#### Scenario: Tap-only scale entry
- **WHEN** the user taps a readiness or sleep-quality chip
- **THEN** the value is selected without a keyboard appearing, and tapping the selected chip again clears it

#### Scenario: Weight unit reflects profile
- **WHEN** the athlete profile specifies a weight unit
- **THEN** the weight field label shows that unit instead of the kg default

### Requirement: Save wellness via Bearer API
Submitting the form SHALL call `POST /api/wellness` with `health:write` using the authenticated API client and the local calendar date. The save control SHALL read "Update check-in" when the form was prefilled from today's existing wellness record and "Save check-in" otherwise, and SHALL show a visible in-place success confirmation after a successful save.

#### Scenario: Successful save
- **WHEN** the user saves a valid check-in
- **THEN** the app shows a success confirmation on the save control and the server receives the wellness payload

#### Scenario: Update label when prefilled
- **WHEN** today's wellness record prefilled any field
- **THEN** the save control is labeled "Update check-in"
