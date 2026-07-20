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

### Requirement: Log tab hosts two write jobs
The Log tab SHALL present daily wellness check-in and recovery-event logging as separate jobs (distinct sections or screens), not a single merged form.

#### Scenario: Both jobs reachable
- **WHEN** the authenticated user opens Log
- **THEN** they can reach the wellness check-in form and the recovery-event flow without leaving the Log area of the app

### Requirement: Log remains free of Sports settings
The Log tab SHALL NOT host sport-profile threshold editing; that surface lives under Settings → Sports.

#### Scenario: No Sports segment on Log
- **WHEN** the authenticated user opens Log
- **THEN** they do not see a Sports segment in the Log chrome

### Requirement: Wellness check-in is not Daily Coach Check-In
The Log tab wellness form SHALL remain the athlete-reported wellness path (`POST /api/wellness`) and MUST NOT host or replace the AI Daily Coach Check-In questionnaire (`/api/checkin/*`). Product copy MAY refer to Log as wellness check-in to reduce confusion with Daily Coach Check-In on Today.

#### Scenario: Log stays wellness
- **WHEN** the authenticated user opens Log
- **THEN** they see the wellness form (and recovery jobs) and do not complete the AI Daily Coach Check-In questionnaire there

