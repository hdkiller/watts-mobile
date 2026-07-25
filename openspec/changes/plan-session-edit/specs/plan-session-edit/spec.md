## ADDED Requirements

### Requirement: Create a planned session
From the Plan tab week view the athlete SHALL be able to create a planned workout on a chosen day via Bearer `POST /api/planned-workouts` (or documented successor), supplying at minimum a title, an activity type, and a duration, with optional TSS and description. The day picker SHALL be constrained to the plan week being viewed.

#### Scenario: Create succeeds
- **WHEN** the athlete fills the session editor for a day in the current plan week and the API succeeds
- **THEN** the new session appears in that week's session list

#### Scenario: Missing required fields
- **WHEN** the athlete submits without a title, type, or duration
- **THEN** the editor shows which field is required and sends nothing

#### Scenario: Create fails
- **WHEN** the create request fails
- **THEN** the athlete sees an honest error and the week list is unchanged

### Requirement: Edit a planned session
The athlete SHALL be able to edit a planned workout's title, activity type, duration, TSS, and description via Bearer `PATCH /api/planned-workouts/{id}` (or documented successor), from the session action sheet in the week view and from the planned detail screen.

#### Scenario: Edit succeeds
- **WHEN** the athlete changes a session's duration and saves, and the API succeeds
- **THEN** the session row and the planned detail reflect the new duration

#### Scenario: Edit fails
- **WHEN** the update request fails
- **THEN** the athlete sees an honest error and the previous values remain

#### Scenario: Edit may be overwritten by adaptation
- **WHEN** the athlete edits a session that plan adaptation is able to regenerate, and the server does not preserve manual edits
- **THEN** the athlete is told before saving that a later plan adaptation may replace this session

### Requirement: Delete a planned session
The athlete SHALL be able to delete a planned workout via Bearer `DELETE /api/planned-workouts/{id}` (or documented successor), behind an explicit confirmation.

#### Scenario: Delete confirmed
- **WHEN** the athlete confirms deletion and the API succeeds
- **THEN** the session disappears from the week list and from Upcoming

#### Scenario: Delete cancelled
- **WHEN** the athlete dismisses the confirmation
- **THEN** nothing is sent and the session remains

#### Scenario: Undo only when honest
- **WHEN** the server cannot restore a deleted session
- **THEN** no undo affordance is offered for that deletion

### Requirement: Existing session actions preserved
Moving a session to another day, generating its structure, completing it, and skipping it SHALL continue to work unchanged alongside create, edit, and delete.

#### Scenario: Move still works
- **WHEN** the athlete moves a session after this change
- **THEN** the move sheet and its undo behave as before

### Requirement: No architect surface
Session editing SHALL be delivered through sheets and the existing planned detail screen. The app MUST NOT introduce a drag-and-drop plan board, multi-select bulk editing, plan templates, or library publish/link controls.

#### Scenario: Mobile idiom preserved
- **WHEN** the athlete edits sessions on mobile
- **THEN** they do so through action sheets and forms, not a draggable timeline board

### Requirement: Plan consistency after session writes
After a session is created, edited, or deleted, the app SHALL invalidate the plan week sessions and upcoming planned queries so week lists, week target stats, and Upcoming reflect the change.

#### Scenario: Week stats stay consistent
- **WHEN** a session is added or deleted
- **THEN** the week session list and Upcoming update to match
