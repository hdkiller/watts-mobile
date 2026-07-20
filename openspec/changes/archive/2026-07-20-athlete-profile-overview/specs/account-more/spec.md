## ADDED Requirements

### Requirement: Athlete profile entry labeling
The More tab SHALL provide an entry to the Athlete destination whose label or subtitle indicates profile / AI overview access (not metrics-only), while still reaching the same Athlete screen that includes metric editing.

#### Scenario: More entry wording
- **WHEN** the authenticated user opens More
- **THEN** an Athlete (or Athlete profile) row is available that navigates to `/(app)/athlete`

#### Scenario: Not metrics-only implication
- **WHEN** the Athlete profile overview is implemented
- **THEN** More does not label the entry in a way that implies only a metrics form with no profile summary
