## MODIFIED Requirements

### Requirement: Hydration quick-add
The system SHALL provide a hydration quick-add action that records water volume for today using a Bearer-capable nutrition API path. Preset volumes MUST come from the athlete’s nutrition settings `quickAddVolumes` (three values) when available, with a sensible default trio while settings are loading or unavailable.

#### Scenario: Add water
- **WHEN** the user quick-adds a hydration volume and the request succeeds
- **THEN** today’s hydration total updates in the UI

#### Scenario: Presets from settings
- **WHEN** nutrition settings include three `quickAddVolumes`
- **THEN** the hydration quick-add UI presents those three volumes as presets

### Requirement: Web escape for nutrition planning
Nutrition quick-log SHALL offer Open web for meal planning, grocery, or deeper nutrition tools rather than porting those surfaces. Profile → Nutrition calibration settings are edited in Settings → Nutrition, not via this Open web escape.

#### Scenario: Open web from nutrition
- **WHEN** the user chooses Open web from the nutrition surface
- **THEN** the system browser opens the configured instance nutrition area when known, otherwise instance home
