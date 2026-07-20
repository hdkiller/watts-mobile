## ADDED Requirements

### Requirement: Refine or Refresh sheet
When today’s recommendation is present, the Today surface SHALL offer a Refine action that opens a sheet titled “Refine or Refresh” with description that the athlete may provide feedback to adjust the plan or leave empty to refresh with latest data.

#### Scenario: Open refine from hero
- **WHEN** a recommendation is loaded and the user taps Refine
- **THEN** the app presents an optional feedback field and a submit control

### Requirement: Empty feedback refreshes; non-empty refines
Submitting the refine sheet SHALL call `POST /api/recommendations/today` with Bearer auth. Empty/whitespace feedback SHALL omit `userFeedback` (refresh). Non-empty feedback SHALL send `{ userFeedback }` (refine). The primary button label SHALL read “Refresh Data” when feedback is empty and “Refine Plan” when feedback is non-empty.

#### Scenario: Refresh with empty feedback
- **WHEN** the user submits with an empty feedback field
- **THEN** the client POSTs generate without a userFeedback body field and enters the shared generating flow

#### Scenario: Refine with feedback
- **WHEN** the user submits feedback such as feeling extra tired
- **THEN** the client POSTs `{ userFeedback }` with that text and enters the shared generating flow

### Requirement: Shared generating and quota handling
Refine or Refresh SHALL reuse the same generating, timeout, error, and 429 quota handling as Analyze Readiness, and SHALL disable competing generate/refine actions while a job is in flight.

#### Scenario: Quota exceeded
- **WHEN** generate returns 429 during refine or refresh
- **THEN** the UI shows an honest quota message and does not silently retry

#### Scenario: Success refreshes Today
- **WHEN** generation completes successfully
- **THEN** Today refetches and the recommendation hero updates to the new result
