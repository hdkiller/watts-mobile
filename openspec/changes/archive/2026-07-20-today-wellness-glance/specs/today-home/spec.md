# today-home Delta — Today Wellness Glance

## MODIFIED Requirements

### Requirement: Today decision surface
The Today tab SHALL present a single scrollable morning surface with: greeting/date, recommendation hero (action + short rationale) or planned-only hero when no recommendation but today’s planned workout exists, planned workout summary when available alongside a recommendation, a read-only Recent Wellness glance per `today-wellness-glance` when wellness data or an empty-state affordance applies, a named Active Recovery Context band, primary CTAs, then thin Coming up and Recently glances. The first viewport MUST remain one decision composition — glances MUST appear below primary CTAs (or below the recovery band when no CTAs are shown) and MUST NOT introduce calendar heatmaps, CTL grids, or dashboard stat strips. The system MUST NOT present recommendation-`analysisJson` Sleep/HRV labels as if they were device wellness biometrics once the Recent Wellness glance is available.

#### Scenario: Recommendation present
- **WHEN** today’s recommendation is loaded successfully
- **THEN** the hero shows the recommended action and a one-to-two line reason above the primary CTAs

#### Scenario: First viewport focus
- **WHEN** the Today tab renders with data
- **THEN** the primary decision CTAs (or planned-only hero actions) are visible without navigating to another tab

#### Scenario: Glances below decision
- **WHEN** Today renders Coming up or Recently teasers
- **THEN** those sections appear below the primary decision CTAs when CTAs are present

#### Scenario: Recent Wellness context
- **WHEN** recent wellness metrics are available
- **THEN** Today shows the Recent Wellness glance as compact context near Active Recovery Context, not as a dashboard header above the hero

#### Scenario: No AI biometric strip
- **WHEN** the Recent Wellness glance is implemented
- **THEN** Today does not show a separate Sleep/HRV tile strip derived only from recommendation analysis JSON

## ADDED Requirements

### Requirement: Wellness glance does not block decision
Loading or failure of wellness/profile trend queries MUST NOT block rendering of the recommendation hero, planned workout, or primary CTAs. The Recent Wellness glance SHALL omit or show a quiet unavailable state on wellness fetch failure.

#### Scenario: Wellness slow or failing
- **WHEN** the wellness or profile dashboard query is loading or errors
- **THEN** the recommendation/planned decision surface still renders and the glance is omitted or shows a short unavailable state
