## ADDED Requirements

### Requirement: Activity glance on Athlete overview
The Athlete destination SHALL present the rolling twelve-week activity glance (done/planned day circles) in addition to the identity header, HR thresholds, and AI Athlete Profile summary. The glance MUST remain a compact companion strip and MUST NOT replace Recent/Upcoming lists or become a year heatmap or analytics explorer.

#### Scenario: Overview includes activity glance
- **WHEN** the athlete opens Athlete with profile data available
- **THEN** the screen shows the activity glance alongside the existing profile overview content

#### Scenario: Glance failure does not hide overview
- **WHEN** the activity glance fails to load
- **THEN** identity, HR, and AI overview content remain available and the glance shows an inline error
