## ADDED Requirements

### Requirement: Monthly Progress glance does not block decision
The Today tab MAY show a Monthly Progress glance below primary recommendation / Accept CTAs (alongside Training Load and week glances). Monthly Progress MUST NOT push primary CTAs out of the first-viewport decision composition when a recommendation exists, and MUST NOT introduce a first-viewport dashboard chart.

#### Scenario: Placement
- **WHEN** Monthly Progress data is available
- **THEN** it appears as a thin context glance after decision CTAs, not as a hero dashboard card

#### Scenario: Failure soft
- **WHEN** monthly-comparison fails or is forbidden
- **THEN** Today still presents the recommendation decision surface
