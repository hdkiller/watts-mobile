## ADDED Requirements

### Requirement: Weekly nutrition plan on Plan tab
When nutrition tracking is enabled, Plan → Nutrition SHALL show a weekly nutrition plan for a navigable week including per-day rows with fueling/plan status and target progress when the API provides them.

#### Scenario: Week with plan data
- **WHEN** the athlete opens Plan → Nutrition and a weekly plan exists
- **THEN** they see the week navigator and day rows reflecting plan status

#### Scenario: Tracking disabled
- **WHEN** nutrition tracking is off
- **THEN** Plan → Nutrition shows honest copy and a path to Settings → Nutrition rather than a meal grid

### Requirement: Generate draft plan
Plan → Nutrition SHALL allow generating a weekly draft meal plan via Bearer `POST /api/nutrition/plan/generate` (or documented successor) and MUST show progress/failure honesty.

#### Scenario: Generate success
- **WHEN** draft generate succeeds
- **THEN** day rows refresh to show planned meals/windows

### Requirement: Day regenerate
Plan → Nutrition SHALL allow regenerating a day’s fueling plan via Bearer day generate API and refreshing that day’s windows/meals.

#### Scenario: Regenerate day
- **WHEN** the athlete confirms regenerate for a day and the API succeeds
- **THEN** that day’s plan content updates in the UI

### Requirement: Meal actions
For planned meals/windows, the athlete SHALL be able to mark complete, skip, unlock, and replace (including locking a recommended meal) via Bearer meal APIs.

#### Scenario: Mark meal done
- **WHEN** the athlete marks a planned meal complete and the API succeeds
- **THEN** the meal shows completed status in the day view

#### Scenario: Replace meal
- **WHEN** the athlete replaces a meal with a recommendation and lock succeeds
- **THEN** the window shows the new meal

### Requirement: Grocery list
Plan → Nutrition SHALL provide a grocery list from `GET /api/nutrition/grocery` (or documented successor) for a selectable range, aggregating ingredients from planned non-skipped meals. When no planned meals exist, the list SHALL show honest empty copy prompting generate/lock first.

#### Scenario: Grocery with meals
- **WHEN** planned meals with ingredients exist in range
- **THEN** the athlete sees an aggregated grocery list

#### Scenario: Grocery empty
- **WHEN** no eligible planned meals exist in range
- **THEN** the athlete sees empty copy and MUST NOT see fabricated items

### Requirement: Log remains capture surface
Nutrition plan actions MUST NOT replace Log quick-log. Completing a meal on the plan MAY deep-link to Log when capturing intake, but weekly planning remains on Plan → Nutrition.

#### Scenario: Quick-log still on Log
- **WHEN** the athlete wants to photo/log a free-form meal
- **THEN** Log nutrition capture remains available
