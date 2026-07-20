## ADDED Requirements

### Requirement: View Details opens recommendation breakdown
When today’s recommendation is present, the Today surface SHALL offer a View Details action that opens a sheet titled “Today’s Training Recommendation” with a short helper that suggested changes apply only if the athlete explicitly accepts them.

#### Scenario: Open details from hero
- **WHEN** a recommendation is loaded and the user taps View Details
- **THEN** the app presents the detail sheet without leaving the Today tab stack pattern used for other sheets

### Requirement: Detail content sections
The detail sheet SHALL show: recommendation action badge, confidence when available, Why? (`reasoning`), Recovery Context when Active Recovery items exist for today, Key Factors when `analysisJson.key_factors` is present, Original Plan when `analysisJson.planned_workout` is present, and Suggested Changes when `analysisJson.suggested_modifications` is present.

#### Scenario: Rest day with factors and original plan
- **WHEN** the recommendation includes reasoning, key factors, and an original planned workout of Rest Day
- **THEN** the sheet shows Why?, Key Factors, and Original Plan with duration/TSS when provided

#### Scenario: Suggested changes visible
- **WHEN** suggested modifications exist and the recommendation is not yet accepted
- **THEN** the sheet shows Suggested Changes with title, duration/TSS, and description when provided

### Requirement: Accept Changes from detail sheet
When suggested modifications exist and the recommendation is not accepted, the detail sheet SHALL offer Accept Changes that uses the same accept mutation as the Today hero Accept action.

#### Scenario: Accept from detail
- **WHEN** the user taps Accept Changes and the API succeeds
- **THEN** Today refreshes, the sheet closes or reflects accepted state, and pending Accept is no longer offered

#### Scenario: Already accepted
- **WHEN** the recommendation is already accepted
- **THEN** Accept Changes is not offered in the detail sheet footer
