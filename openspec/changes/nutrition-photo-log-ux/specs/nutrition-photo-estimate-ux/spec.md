## ADDED Requirements

### Requirement: Analyzing state after capture
When the athlete captures a meal photo for in-sheet estimate, the Log Meal sheet SHALL enter an analyzing state that shows the captured photo (or clear analyzing affordance) and blocks compose editing until estimate succeeds or fails.

#### Scenario: Analysis in progress
- **WHEN** the camera returns a meal image and estimate is requested
- **THEN** the sheet shows an analyzing state with photo context and does not leave the athlete on an unchanged compose form without feedback

#### Scenario: Analysis failure
- **WHEN** estimate-photo fails or is cancelled after capture
- **THEN** the athlete sees an error they can dismiss or retry, and can return to compose without a false “success” review

### Requirement: Estimate review before save
After a successful photo estimate, the Log Meal sheet SHALL present a review state with the estimated meal name, calories, protein, carbs, fat, and meal slot as editable values, and SHALL NOT rely solely on silent prefill of a collapsed form.

#### Scenario: Review shows estimate
- **WHEN** `POST /api/nutrition/estimate-photo` returns a successful estimate
- **THEN** the athlete sees a review surface with editable name and macros (and meal slot) before any save

#### Scenario: Confidence when provided
- **WHEN** the estimate includes a confidence value
- **THEN** the review surface shows that confidence in secondary copy

#### Scenario: Athlete edits then saves
- **WHEN** the athlete changes estimated fields in review and saves
- **THEN** the logged item uses the edited values

### Requirement: Retake from review
From estimate review, the athlete SHALL be able to retake a photo (or clear the estimate) without being forced to dismiss the entire Log Meal sheet.

#### Scenario: Retake
- **WHEN** the athlete chooses Retake from review
- **THEN** the app returns to camera (or clears estimate and returns to compose) so a new estimate can replace the previous one

### Requirement: Explicit save from review
The review state SHALL require an explicit save action to persist the meal; the system MUST NOT auto-save the estimate on analysis success.

#### Scenario: No auto-save
- **WHEN** estimate analysis succeeds
- **THEN** no nutrition write occurs until the athlete confirms save
