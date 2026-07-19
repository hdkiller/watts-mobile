# today-home Delta — Recommendation Hero States

## MODIFIED Requirements

### Requirement: Today decision surface
The Today tab SHALL present a single scrollable morning surface with: greeting/date, recommendation hero (action + short rationale) or planned-only hero when no recommendation but today's planned workout exists, planned workout summary when available alongside a recommendation, optional compact recovery metrics, a named Active Recovery Context band, primary CTAs, then thin Coming up and Recently glances. The recommendation hero SHALL visually encode the action category — train, rest, or modify — through its accent color so the day's shape is recognizable before reading text, and SHALL represent recommendation confidence as a compact non-textual indicator (not a percentage sentence) when confidence is present. The first viewport MUST remain one decision composition — glances MUST appear below primary CTAs (or below the recovery band when no CTAs are shown) and MUST NOT introduce calendar heatmaps, CTL grids, or dashboard stat strips.

#### Scenario: Recommendation present
- **WHEN** today's recommendation is loaded successfully
- **THEN** the hero shows the recommended action and a one-to-two line reason above the primary CTAs

#### Scenario: Action category is color-encoded
- **WHEN** the recommendation action is a rest or modify decision
- **THEN** the hero accent uses the rest or modify tone respectively, while train decisions use the brand tone, and unrecognized actions fall back to the brand tone

#### Scenario: Confidence shown as indicator
- **WHEN** the recommendation includes a confidence value
- **THEN** the hero shows a compact strength indicator (e.g. filled dots) instead of a percentage sentence

#### Scenario: First viewport focus
- **WHEN** the Today tab renders with data
- **THEN** the primary decision CTAs (or planned-only hero actions) are visible without navigating to another tab

#### Scenario: Glances below decision
- **WHEN** Today renders Coming up or Recently teasers
- **THEN** those sections appear below the primary decision CTAs when CTAs are present
