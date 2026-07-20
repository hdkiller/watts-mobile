## ADDED Requirements

### Requirement: Map recommendation detail fields
The client SHALL map activity-recommendation `analysisJson` detail fields into a stable detail view model (or extended Today view model) including key factors, original planned workout summary, and suggested modifications (title, duration, TSS, description) for the recommendation detail sheet. UI MUST NOT depend on ad-hoc reads of nested raw keys outside the mapper.

#### Scenario: Key factors mapped
- **WHEN** `analysisJson.key_factors` is an array of strings
- **THEN** the detail view model exposes those factors for list rendering

#### Scenario: Original plan mapped
- **WHEN** `analysisJson.planned_workout` includes original title, duration, and TSS
- **THEN** the detail view model exposes those values for the Original Plan section

### Requirement: Refine uses generate mutation with optional feedback
The existing generate mutation SHALL accept optional `userFeedback` and be usable from both Analyze Readiness (empty state, typically no feedback) and Refine or Refresh (optional feedback). Success/completion SHALL invalidate or refetch the Today recommendation query.

#### Scenario: Refine with feedback
- **WHEN** Refine submits non-empty feedback
- **THEN** the client calls `POST /api/recommendations/today` with `{ userFeedback }` and Bearer auth
