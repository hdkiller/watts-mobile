## MODIFIED Requirements

### Requirement: Map recommendation detail fields
The client SHALL map activity-recommendation `analysisJson` detail fields into a stable detail view model (or extended Today view model) including key factors, recovery_analysis driver fields when present, original planned workout summary, and suggested modifications (title, duration, TSS, description) for the recommendation detail sheet. UI MUST NOT depend on ad-hoc reads of nested raw keys outside the mapper.

#### Scenario: Key factors mapped
- **WHEN** `analysisJson.key_factors` is an array of strings
- **THEN** the detail view model exposes those factors for list rendering

#### Scenario: Recovery analysis mapped
- **WHEN** `analysisJson.recovery_analysis` includes sleep_quality, hrv_status, fatigue_level, or readiness_score
- **THEN** the detail view model exposes those values for the drivers section

#### Scenario: Original plan mapped
- **WHEN** `analysisJson.planned_workout` includes original title, duration, and TSS
- **THEN** the detail view model exposes those values for the Original Plan section

## ADDED Requirements

### Requirement: Driver rows for detail transparency
The client SHALL provide a pure mapping helper that builds ordered plain-language driver rows for the recommendation detail sheet from mapped recovery_analysis and key_factors (deduplicating obvious overlaps when practical). The helper MUST NOT invent load, CTL, HRV, sleep, or fuel values that are absent from the recommendation or separately loaded nutrition payload.

#### Scenario: Empty drivers
- **WHEN** recovery_analysis and key_factors yield no displayable rows
- **THEN** the helper returns an empty list (UI shows the limited-inputs state)

#### Scenario: No invented metrics
- **WHEN** only reasoning is present and analysis driver fields are null
- **THEN** the helper does not synthesize placeholder sleep/HRV/load rows
