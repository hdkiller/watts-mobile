## ADDED Requirements

### Requirement: In-sheet AI photo estimate on Log Meal
The Log Meal sheet SHALL offer an in-sheet AI photo estimate path that calls `POST /api/nutrition/estimate-photo` and leads into estimate review before save, without replacing manual quick-log, hydration quick-add, or the Coach photo attach path where offered.

#### Scenario: Start in-sheet photo estimate
- **WHEN** the athlete chooses photo estimate from Log Meal
- **THEN** the app opens camera (or equivalent capture) for a meal image and proceeds to analyzing/review per nutrition-photo-estimate-ux

#### Scenario: Manual path remains
- **WHEN** the athlete logs a meal without using photo estimate
- **THEN** they can still enter name/macros manually and save

### Requirement: Post-save day nutrition confirmation
After a successful meal save from the Log Meal sheet, the system SHALL show a confirmation that includes updated day nutrition progress (calories and available macros vs goals when known) before the sheet fully dismisses, rather than closing with no progress feedback.

#### Scenario: Logged progress shown
- **WHEN** the athlete successfully saves a meal from Log Meal
- **THEN** they see a Logged confirmation with refreshed day nutrition progress for the selected date

#### Scenario: Athlete dismisses confirmation
- **WHEN** the athlete finishes the Logged confirmation (Done or equivalent auto-dismiss)
- **THEN** the Log Meal sheet closes and Log tab day totals reflect the save

#### Scenario: Factual tone
- **WHEN** post-save progress is shown
- **THEN** copy reports progress factually (logged item and day position) without gamified celebration chrome
