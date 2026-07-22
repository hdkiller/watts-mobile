# nutrition-summary-detail-modals Specification

## Purpose
TBD - created by archiving change nutrition-summary-detail-modals. Update Purpose after archive.
## Requirements
### Requirement: Tap daily summary metric to open analysis
The system SHALL let the authenticated user open a target-analysis sheet by tapping a calorie or macro summary tile (calories, carbs, protein, fat) on the Log nutrition surface when a daily goal or fueling plan is available for that day.

#### Scenario: Open calories analysis from Log
- **WHEN** today’s nutrition has a calorie goal or fueling plan and the user taps the calories summary tile
- **THEN** the app presents an analysis sheet titled for calories (e.g. “Calories Analysis”) showing today’s logged calories and the total daily calorie target

#### Scenario: Open macro analysis from Log
- **WHEN** today’s nutrition has a goal for that macro or a fueling plan and the user taps carbs, protein, or fat
- **THEN** the app presents an analysis sheet for that macro showing today’s logged amount and the total daily target

#### Scenario: No target available
- **WHEN** the selected metric has no daily goal and no fueling plan for today
- **THEN** the summary tile does not open an analysis sheet

### Requirement: Analysis sheet structure
The nutrition analysis sheet SHALL present, for the selected metric: (1) header with metric identity and logged actual, (2) total daily target with progress against the target, (3) calculation-logic rows explaining how the target was derived, (4) a coach insight message, and (5) a dismiss control.

#### Scenario: Sheet sections visible
- **WHEN** the analysis sheet is open for a metric with a target
- **THEN** the user sees the actual value, total daily target, at least one calculation-logic row when data exists, a coach insight, and can dismiss the sheet

#### Scenario: Dismiss sheet
- **WHEN** the user chooses Close (or the platform dismiss gesture)
- **THEN** the analysis sheet closes and the Log nutrition surface remains underneath

### Requirement: Calories calculation logic from fueling plan
When calories analysis is open and `fuelingPlan.dailyTotals` is available, the system SHALL show calculation-logic rows consistent with the web calories analysis: non-exercise baseline (manual or auto), per-workout energy contributions when present (with ACTUAL or EST indication), or aggregated training demand, and goal adjustment when materially non-zero.

#### Scenario: Manual baseline and workout estimates
- **WHEN** the plan has a manual non-exercise baseline and workout calorie entries
- **THEN** the calculation-logic list includes the baseline value and each workout contribution with an estimated or actual badge as provided by the plan

#### Scenario: Goal adjustment row
- **WHEN** the plan’s calorie adjustment is materially non-zero
- **THEN** the calculation-logic list includes a goal-adjustment row reflecting that adjustment

### Requirement: Macro calculation logic
When carbs, protein, or fat analysis is open, the system SHALL show calculation-logic rows that explain the daily gram target using available fueling-plan windows and athlete/settings inputs (when loaded), including progress remaining or above target, aligned with the web macro analysis behavior.

#### Scenario: Window allocations present
- **WHEN** the fueling plan includes window macro targets for the selected macro
- **THEN** the calculation-logic list includes workout-window and/or daily-base allocation rows derived from those windows

#### Scenario: Progress against target
- **WHEN** a macro analysis sheet is open with a positive target
- **THEN** the calculation-logic list includes a progress row describing grams remaining or grams above target

### Requirement: Graceful degradation without settings
The system SHALL still open analysis when nutrition settings cannot be loaded, using fueling-plan fields and known totals, and MUST NOT invent baseline settings values that contradict the server plan.

#### Scenario: Settings unavailable
- **WHEN** the user opens analysis and nutrition settings are missing or fail to load
- **THEN** the sheet still shows actual, target, progress, and plan-derived rows that do not require those settings

### Requirement: Client uses existing nutrition read data
The system SHALL build analysis content from data already available via Bearer nutrition/profile reads (notably `GET /api/nutrition` fueling plan fields, and athlete weight / nutrition settings when available). It MUST NOT introduce a new explain write API or client-side recomputation of the fueling plan targets themselves.

#### Scenario: No invented targets
- **WHEN** analysis rows are rendered
- **THEN** the total daily target shown matches the canonical goal already displayed on the nutrition summary for that metric

