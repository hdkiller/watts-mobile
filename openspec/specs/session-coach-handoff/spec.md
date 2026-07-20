# session-coach-handoff Specification

## Purpose
TBD - created by archiving change companion-session-field-value. Update Purpose after archive.
## Requirements
### Requirement: Discuss session from planned detail
The planned workout detail screen SHALL offer a Discuss with Coach (or equivalent) action that navigates to the Coach tab with session handoff parameters identifying the planned workout.

#### Scenario: Open Coach from planned detail
- **WHEN** the user chooses Discuss with Coach on planned detail
- **THEN** the app navigates to Coach with enough context to seed a discussion about that planned workout

### Requirement: Discuss session from activity detail
The activity summary screen SHALL offer a Discuss with Coach (or equivalent) action that navigates to the Coach tab with session handoff parameters identifying the completed workout.

#### Scenario: Open Coach from activity detail
- **WHEN** the user chooses Discuss with Coach on activity detail
- **THEN** the app navigates to Coach with enough context to seed a discussion about that activity

### Requirement: Session-scoped seed context
When Coach is opened via session handoff, the system SHALL build a short non-prescriptive seed from known session fields (at least title and kind; plus date, type, and key metrics or adherence summary when present) and MUST NOT invent training prescriptions on the client. Athlete-visible message bubbles SHALL continue to strip internal seed prefixes.

#### Scenario: Seed includes session identity
- **WHEN** session handoff opens an empty or eligible room and the user sends the first discuss turn
- **THEN** the outbound context includes the session title and whether it is planned or completed

#### Scenario: No invented prescription
- **WHEN** session seed is built
- **THEN** the seed does not invent new workout structure, targets, or medical advice beyond server-provided fields

### Requirement: Preserve Coach room policy
Session handoff SHALL reuse existing Coach room selection and idle-reuse policy rather than always forcing a new room, unless product policy later changes.

#### Scenario: Room policy reused
- **WHEN** the user opens Discuss with Coach from a session detail
- **THEN** active-room selection follows the same session policy as other Coach entry points

