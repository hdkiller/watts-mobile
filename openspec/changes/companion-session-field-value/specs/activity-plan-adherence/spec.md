## ADDED Requirements

### Requirement: Plan adherence glance on activity detail
When `GET /api/workouts/:id` includes `planAdherence` with usable content, the activity summary screen SHALL show a compact adherence glance with overall score (when present) and short summary text (when present), plus honest analysis status when adherence is pending or failed. The system MUST NOT invent adherence scores or summaries.

#### Scenario: Adherence ready
- **WHEN** plan adherence is present with a completed/ready status and score or summary
- **THEN** the activity detail shows a Plan adherence section with the available score and/or summary

#### Scenario: Adherence pending or failed
- **WHEN** plan adherence exists but analysis is pending or failed
- **THEN** the section shows an honest status label and MUST NOT fabricate a score

#### Scenario: Adherence absent
- **WHEN** the workout payload has no plan adherence
- **THEN** the activity detail does not show a Plan adherence section

### Requirement: Open linked plan from adherence
When adherence (or the workout) includes a `plannedWorkoutId`, the adherence glance SHALL offer navigation to that planned workout’s in-app detail screen.

#### Scenario: View plan
- **WHEN** the user taps View plan (or equivalent) and a planned workout id is known
- **THEN** the app navigates to the in-app planned detail for that id

### Requirement: No in-app adherence regeneration
The activity detail MUST NOT offer Analyze or Regenerate for plan adherence in this change; deeper adherence tools remain Open web.

#### Scenario: No regenerate control
- **WHEN** the user views the adherence glance
- **THEN** there is no in-app control to analyze or regenerate plan adherence
