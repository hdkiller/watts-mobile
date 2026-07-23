## ADDED Requirements

### Requirement: Nutrition settings entry from Settings
The Settings hub SHALL provide a Nutrition entry that opens an in-app Nutrition settings screen (not Open web Profile Settings).

#### Scenario: Open Nutrition settings
- **WHEN** the authenticated user opens Settings and chooses Nutrition
- **THEN** the app navigates to the native Nutrition settings screen

### Requirement: Load nutrition settings via Bearer
The Nutrition settings screen SHALL load current settings via `GET /api/profile/nutrition` with Bearer `nutrition:read` and present an honest loading/error/retry state.

#### Scenario: Settings load
- **WHEN** the request succeeds
- **THEN** the form shows the server values for tracking, metabolic, meal schedule, constraints, fuel calibration, adaptive engine, and hydration fields

#### Scenario: Settings load error
- **WHEN** the request fails
- **THEN** the user sees an error and can retry

### Requirement: Edit and save nutrition settings
The system SHALL let the user edit Profile → Nutrition fields and save via `POST /api/profile/nutrition` with Bearer `nutrition:write`, matching the web settings payload shape (including `nutritionTrackingEnabled` and `UserNutritionSettings` fields).

#### Scenario: Successful save
- **WHEN** the user saves a valid form
- **THEN** the client posts to the server, shows success feedback, and refreshes dependent nutrition/profile/today data

#### Scenario: Save error
- **WHEN** the save fails
- **THEN** the user sees an error and can retry without losing in-progress edits

#### Scenario: Save disabled when pristine
- **WHEN** the form has no unsaved changes
- **THEN** Save is disabled (or equivalent no-op)

### Requirement: Field parity with web Profile Nutrition
The Nutrition settings screen SHALL expose the same athlete-editable field groups as web Profile → Nutrition: tracking toggle, metabolic/calories, meal schedule, dietary constraints, fuel calibration, adaptive engine, and hydration (sweat rate, sodium target, exactly three quick-add volumes).

#### Scenario: Tracking toggle
- **WHEN** the user turns nutrition tracking off and saves
- **THEN** the server receives `nutritionTrackingEnabled: false` and Log/Today nutrition surfaces hide after profile refresh

#### Scenario: Hydration quick-add volumes
- **WHEN** the user edits the three quick-add volumes and saves
- **THEN** subsequent hydration quick-add UI uses those three volumes

### Requirement: No planning surfaces in Nutrition settings
Nutrition settings MUST NOT include meal-plan generation, grocery editing, day regenerate, chart preference editors, or Danger Zone wipe.

#### Scenario: Planning stays out
- **WHEN** the user is on Nutrition settings
- **THEN** there is no control to generate a meal plan, edit grocery lists, or wipe nutrition data
