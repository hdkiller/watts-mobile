## ADDED Requirements

### Requirement: Interactive daily summary tiles
The Log nutrition daily summary SHALL treat calorie and macro tiles (calories, carbs, protein, fat) as interactive entry points into target analysis when a daily goal or fueling plan is available, without removing existing quick-log, hydration, photo, or Open web actions.

#### Scenario: Summary remains visible with tap affordance
- **WHEN** today’s nutrition totals are shown with goals
- **THEN** the user can still read actual vs goal on each tile and can tap a calorie or macro tile to open analysis

#### Scenario: Quick-log actions unchanged
- **WHEN** the user uses meal quick-log, hydration quick-add, Log with photo, or Open web
- **THEN** those flows behave as before and are not replaced by the analysis sheet
