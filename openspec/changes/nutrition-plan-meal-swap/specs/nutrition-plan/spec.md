## ADDED Requirements

### Requirement: Window-structured day view
The Plan → Nutrition day view SHALL present the day as its fueling windows. Each window SHALL show its type, its scheduled time when the API provides one, and its macro targets, with its locked meal shown beneath it or an explicit empty slot when no meal is locked.

#### Scenario: Day with mixed windows
- **WHEN** the athlete opens a day whose windows are partly filled
- **THEN** filled windows show their meal and empty windows show an empty slot with the window's targets

#### Scenario: Window targets visible before deciding
- **WHEN** the athlete looks at a fueling window
- **THEN** they can see what that window is asking for without opening a meal

### Requirement: Meal recommendations for a window
The athlete SHALL be able to request meal options for a specific date and fueling window via Bearer `POST /api/nutrition/recommendations/meal` (or documented successor). Options MUST be fetched on demand for the opened window and MUST NOT be prefetched while rendering the week.

#### Scenario: Options load
- **WHEN** the athlete opens the meal picker for a window and the API succeeds
- **THEN** they see the returned meal options with titles and macro totals

#### Scenario: Recommendation is slow
- **WHEN** the recommendation request is still pending
- **THEN** the picker shows a pending state, and after a prolonged wait an honest still-working hint

#### Scenario: Quota exhausted
- **WHEN** the recommendation request fails because the AI quota is exhausted
- **THEN** the athlete sees quota-specific copy distinguishable from a generic failure

#### Scenario: Recommendation fails
- **WHEN** the recommendation request fails for any other reason
- **THEN** the athlete sees an honest error and the window is left unchanged

### Requirement: Lock a chosen meal into a window
The athlete SHALL be able to lock a chosen meal into a fueling window. When the window is empty, the app SHALL use Bearer `POST /api/nutrition/plan/meal`. When the window already holds a meal, the app SHALL use Bearer `PATCH /api/nutrition/plan/meals/{mealId}` with `action: 'replace'`. After either write the plan SHALL be re-read rather than assumed.

#### Scenario: Fill an empty window
- **WHEN** the athlete picks a meal for an empty window and the lock succeeds
- **THEN** the window shows the chosen meal

#### Scenario: Replace an existing meal
- **WHEN** the athlete picks a different meal for a window that already has one and the replace succeeds
- **THEN** the window shows the new meal in place of the old one

#### Scenario: Lock fails
- **WHEN** the lock or replace request fails
- **THEN** the window keeps its previous content and the athlete sees an honest error

### Requirement: Existing meal actions preserved
Marking a planned meal complete, skipped, or unlocked SHALL continue to work unchanged, and SHALL remain available when meal recommendations are unavailable.

#### Scenario: Actions without AI
- **WHEN** recommendations cannot be fetched
- **THEN** complete, skip, and unlock remain usable on already-planned meals
