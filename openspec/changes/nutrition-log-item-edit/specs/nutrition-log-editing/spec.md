## ADDED Requirements

### Requirement: Day entries list
The nutrition day surface SHALL list the individual items logged for the selected day, showing at minimum the item name, its macros, and its meal slot. When the day has no logged items, the list SHALL show honest empty copy and MUST NOT fabricate rows.

#### Scenario: Day with logged items
- **WHEN** the athlete opens the nutrition day surface for a day with logged items
- **THEN** each logged item appears as its own row with name, macros, and meal slot

#### Scenario: Day with no items
- **WHEN** the selected day has no logged nutrition
- **THEN** the athlete sees empty copy and no item rows

### Requirement: Edit a logged item
The athlete SHALL be able to edit a logged item's name, calories, protein, carbs, fat, and meal slot via Bearer `PATCH /api/nutrition/{id}/items` with `action: 'update'` (or documented successor). On success the day totals and targets SHALL be re-read from the server rather than recomputed on device.

#### Scenario: Edit succeeds
- **WHEN** the athlete changes an item's macros and saves, and the API succeeds
- **THEN** the row reflects the new values and the day totals refresh from the server

#### Scenario: Edit fails
- **WHEN** the update request fails
- **THEN** the athlete sees an honest error and the original values remain

#### Scenario: Item without an id
- **WHEN** a logged item has no id in the API payload
- **THEN** edit and delete actions are not offered for that row

### Requirement: Delete a logged item
The athlete SHALL be able to delete a logged item via Bearer `PATCH /api/nutrition/{id}/items` with `action: 'delete'` (or documented successor), behind an explicit confirmation. The row MAY be removed optimistically and MUST be restored if the request fails.

#### Scenario: Delete confirmed
- **WHEN** the athlete confirms deleting an item and the API succeeds
- **THEN** the row disappears and the day totals refresh from the server

#### Scenario: Delete fails
- **WHEN** the delete request fails after optimistic removal
- **THEN** the row reappears and the athlete sees an honest error

#### Scenario: Delete cancelled
- **WHEN** the athlete dismisses the confirmation
- **THEN** nothing is sent and the item remains

### Requirement: Day notes
The athlete SHALL be able to read and write a free-text note for the nutrition day via Bearer `PATCH /api/nutrition/{id}/notes` (or documented successor).

#### Scenario: Save note
- **WHEN** the athlete saves a day note and the API succeeds
- **THEN** the note persists and is shown when the day is reopened

### Requirement: Consistency after correction
After any item edit, delete, or note write, the app SHALL invalidate the day-nutrition, nutrition-glance, and nutrition-plan queries so totals, rings, and fuel state reflect the correction.

#### Scenario: Totals stay consistent
- **WHEN** an item is edited or deleted
- **THEN** Today's nutrition totals and any visible fuel-state glance update to match the corrected day
