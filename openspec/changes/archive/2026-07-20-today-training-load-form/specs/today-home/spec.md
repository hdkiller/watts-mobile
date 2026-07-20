## MODIFIED Requirements

### Requirement: Today decision surface
The Today tab SHALL present a single scrollable morning surface with: greeting/date, recommendation hero (action + short rationale) or planned-only hero when no recommendation but today’s planned workout exists, planned workout summary when available alongside a recommendation, optional compact recovery metrics, a named Active Recovery Context band, primary CTAs, then thin context glances including Training Load & Form (when PMC summary is available), Coming up, and Recently. The first viewport MUST remain one decision composition — glances MUST appear below primary CTAs (or below the recovery band when no CTAs are shown) and MUST NOT introduce calendar heatmaps, CTL grids, or dashboard stat strips on the tab itself. Training Load PMC charts belong in the Training Load & Form sheet, not the first viewport.

#### Scenario: Recommendation present
- **WHEN** today’s recommendation is loaded successfully
- **THEN** the hero shows the recommended action and a one-to-two line reason above the primary CTAs

#### Scenario: First viewport focus
- **WHEN** the Today tab renders with data
- **THEN** the primary decision CTAs (or planned-only hero actions) are visible without navigating to another tab

#### Scenario: Glances below decision
- **WHEN** Today renders Coming up or Recently teasers
- **THEN** those sections appear below the primary decision CTAs when CTAs are present

#### Scenario: Training load glance placement
- **WHEN** PMC summary data is available
- **THEN** Today shows the Training Load & Form glance below the primary decision CTAs as compact context, not above the recommendation hero

## ADDED Requirements

### Requirement: Training load glance does not block decision
Loading or failure of the PMC query MUST NOT block rendering of the recommendation hero, planned workout, or primary CTAs.

#### Scenario: PMC slow or failing
- **WHEN** the performance PMC query is loading or errors
- **THEN** the recommendation/planned decision surface still renders and the Training Load glance is omitted or shows a short unavailable state
