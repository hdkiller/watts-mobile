## ADDED Requirements

### Requirement: Sports entry in Settings
The Settings hub SHALL expose a **Sports** destination that lists the athlete’s sport profiles loaded from `GET /api/profile` (`sportSettings`, `profile:read`).

#### Scenario: Profiles listed
- **WHEN** the authenticated user opens Settings → Sports and the profile request succeeds
- **THEN** they see each sport profile with name, default indicator when applicable, and a short summary of key thresholds (FTP / LTHR / Max HR when present)

#### Scenario: Load error
- **WHEN** the profile request fails
- **THEN** the Sports screen shows a recoverable error with retry

### Requirement: Lite per-sport threshold edit
The system SHALL let the athlete open an existing sport profile and edit lite thresholds—FTP, LTHR, and Max HR (and threshold pace when that field is already present on the profile)—and save via `PATCH /api/profile` with a `sportSettings` payload (`profile:write`). The companion MUST NOT require editing zones, indoor FTP / eFTP / W′, activity-type mapping, workout target policy, or detect-from-workouts to complete a lite save.

#### Scenario: Save FTP on a non-default profile
- **WHEN** the user changes FTP on a non-default sport profile and saves successfully
- **THEN** the client persists the change through the profile PATCH sportSettings path and confirms success

#### Scenario: Save failure retains draft
- **WHEN** save fails
- **THEN** the user sees an error and retains entered values for correction

### Requirement: Open web for full Sport Settings
The Sports experience SHALL offer Open web (or equivalent) to the instance Profile Settings Sports surface for zones, detect-from-workouts, activity-type mapping, advanced power fields, and profile lifecycle (create/delete).

#### Scenario: Open web from Sports
- **WHEN** the user chooses Open web from Settings → Sports or a profile editor
- **THEN** the system browser opens the configured instance profile/settings sports path when known

### Requirement: Edit existing profiles only
The lite Sports experience SHALL edit existing profiles returned by the API and MUST NOT require create, delete, rename, or set-default flows on device.

#### Scenario: No create required
- **WHEN** the user opens Settings → Sports with one or more profiles
- **THEN** they can open and edit thresholds without a mandatory create-profile step

### Requirement: Not a Log segment
The Log tab segmented control MUST NOT include a Sports segment; sport-threshold editing lives under Settings.

#### Scenario: Log chrome without Sports
- **WHEN** the authenticated user opens Log
- **THEN** the segment control does not list Sports

### Requirement: Safe stack layout
Sport profile editors presented on a native stack MUST avoid KeyboardAvoidingView layouts that collapse ScrollView height under the header; use the app’s keyboard-overlap padding pattern instead.

#### Scenario: Editor visible
- **WHEN** the user opens a sport profile editor
- **THEN** threshold fields are visible and scrollable (non-zero viewport height)
