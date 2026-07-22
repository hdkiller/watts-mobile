## MODIFIED Requirements

### Requirement: Detail content sections
The detail sheet SHALL show: recommendation action badge, confidence when available, Why? (`reasoning`), Recovery Context when Active Recovery items exist for today, a plain-language **What drove this** (or equivalent) drivers section per the drivers requirement below, Original Plan when `analysisJson.planned_workout` is present, and Suggested Changes when `analysisJson.suggested_modifications` is present. The sheet MUST NOT show a separate duplicate “Key Factors” list once drivers incorporate `key_factors`.

#### Scenario: Rest day with factors and original plan
- **WHEN** the recommendation includes reasoning, key factors, and an original planned workout of Rest Day
- **THEN** the sheet shows Why?, What drove this (including those factors), and Original Plan with duration/TSS when provided

#### Scenario: Suggested changes visible
- **WHEN** suggested modifications exist and the recommendation is not yet accepted
- **THEN** the sheet shows Suggested Changes with title, duration/TSS, and description when provided

## ADDED Requirements

### Requirement: What drove this inputs
The recommendation detail sheet SHALL present a plain-language drivers section that surfaces which inputs informed today’s recommendation using existing payload fields: `analysisJson.recovery_analysis` labels when present (sleep quality, HRV status, fatigue level, readiness score), `analysisJson.key_factors` strings when present, and MUST frame these as recommendation inputs — not as live device biometrics. The section MUST NOT dump raw model chain-of-thought, prompt text, or clinical/diagnostic claims beyond displaying server-provided labels and factor strings.

#### Scenario: Recovery analysis present
- **WHEN** `analysisJson.recovery_analysis` includes one or more of sleep_quality, hrv_status, fatigue_level, or readiness_score
- **THEN** the drivers section shows those values with clear non-biometric coaching labels

#### Scenario: Key factors present
- **WHEN** `analysisJson.key_factors` contains non-empty strings
- **THEN** those strings appear in the drivers section without requiring a second “Key Factors” heading

#### Scenario: Thin or missing drivers
- **WHEN** a recommendation is open in the detail sheet but both recovery_analysis fields and key_factors are absent or empty
- **THEN** the sheet shows an honest limited-inputs message in the drivers area rather than inventing metrics

#### Scenario: No medical claims
- **WHEN** the drivers section renders
- **THEN** copy does not present the recommendation as a medical diagnosis or clinical clearance

### Requirement: Optional fuel context in detail drivers
When nutrition tracking is enabled and today’s fuel state (Eco / Steady / Performance or current vocab) is known from existing nutrition reads, the detail sheet MAY include a single quiet fuel-state row in the drivers section. The sheet MUST NOT become a calorie/macro dashboard or fueling-plan editor.

#### Scenario: Fuel state known
- **WHEN** nutrition tracking is on and today’s fuel state is available
- **THEN** the drivers section may show one fuel-state line using the shared fuel-state label

#### Scenario: Tracking off
- **WHEN** nutrition tracking is disabled
- **THEN** the detail sheet does not show fuel-state driver chrome
