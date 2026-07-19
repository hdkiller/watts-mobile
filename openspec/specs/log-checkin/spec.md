# log-checkin Specification

## Purpose
TBD - created by archiving change phase-2-log-checkin. Update Purpose after archive.
## Requirements
### Requirement: Log check-in form
The Log tab SHALL present a form for feel/readiness, sleep duration, sleep quality, optional notes, and optional weight for the athlete’s local today.

#### Scenario: Form fields visible
- **WHEN** the authenticated user opens Log
- **THEN** they can enter readiness, sleep hours, sleep quality, notes, and weight

### Requirement: Save wellness via Bearer API
Submitting the form SHALL call `POST /api/wellness` with `health:write` using the authenticated API client and the local calendar date.

#### Scenario: Successful save
- **WHEN** the user saves a valid check-in
- **THEN** the app shows a success confirmation and the server receives the wellness payload

### Requirement: Validation before save
The client SHALL require at least one meaningful field (readiness, sleep hours, sleep quality, notes, or weight) before enabling save.

#### Scenario: Empty form blocked
- **WHEN** all fields are empty
- **THEN** save is disabled or shows a validation message

### Requirement: Prefill when today’s wellness exists
When today’s wellness record is available, the Log form SHALL prefill known fields.

#### Scenario: Prefill sleep hours
- **WHEN** today’s wellness includes sleepHours
- **THEN** the sleep hours field is prefilled with that value

