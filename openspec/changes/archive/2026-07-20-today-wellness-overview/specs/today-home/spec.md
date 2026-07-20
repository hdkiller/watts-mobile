## MODIFIED Requirements

### Requirement: Today decision surface
The Today tab SHALL present a single scrollable morning surface with: greeting/date, recommendation hero (action + short rationale) or planned-only hero when no recommendation but today’s planned workout exists, planned workout summary when available alongside a recommendation, optional compact recovery metrics, a named Active Recovery Context band, primary CTAs, then thin context glances including Recent Wellness (when applicable) and Coming up / Recently. The first viewport MUST remain one decision composition — glances MUST appear below primary CTAs (or below the recovery band when no CTAs are shown) and MUST NOT introduce calendar heatmaps, CTL grids, or dashboard stat strips. Tapping Recent Wellness tiles SHALL open Wellness Overview as a sheet and MUST NOT add a wellness form on Today.

#### Scenario: Recommendation present
- **WHEN** today’s recommendation is loaded successfully
- **THEN** the hero shows the recommended action and a one-to-two line reason above the primary CTAs

#### Scenario: First viewport focus
- **WHEN** the Today tab renders with data
- **THEN** the primary decision CTAs (or planned-only hero actions) are visible without navigating to another tab

#### Scenario: Glances below decision
- **WHEN** Today renders Coming up or Recently teasers
- **THEN** those sections appear below the primary decision CTAs when CTAs are present

#### Scenario: Wellness overview from glance
- **WHEN** the athlete taps the Recent Wellness glance tiles on Today
- **THEN** Wellness Overview opens as a sheet and Today does not navigate away from the tab underneath

## ADDED Requirements

### Requirement: Wellness overview does not block decision
Loading or failure of the Wellness Overview detail query MUST NOT block rendering of the recommendation hero, planned workout, or primary CTAs. The overview sheet SHALL show its own loading and error states after open.

#### Scenario: Overview fetch fails
- **WHEN** the athlete opens Wellness Overview and the wellness detail request errors
- **THEN** the sheet shows an honest error/retry state and Today behind the sheet remains usable after dismiss
