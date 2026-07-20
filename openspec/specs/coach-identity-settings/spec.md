# coach-identity-settings Specification

## Purpose
TBD - created by archiving change settings-field-companion. Update Purpose after archive.
## Requirements
### Requirement: Coach identity entry
Settings SHALL provide a Coach identity screen reachable from the Coach section for nickname, persona, About me context, and the require-tool-approval preference.

#### Scenario: Open Coach identity
- **WHEN** the authenticated user chooses Coach identity in Settings
- **THEN** the app opens the lite Coach preferences screen

### Requirement: Load coach identity preferences
The Coach identity screen SHALL load nickname and About me (`aiContext`) from Bearer `GET /api/profile`, and persona plus require-tool-approval from Bearer `GET /api/settings/ai` once that endpoint accepts Bearer auth.

#### Scenario: Values load when APIs available
- **WHEN** the screen opens and both profile and AI settings requests succeed
- **THEN** the user sees nickname, persona, About me, and tool-approval state

#### Scenario: AI settings Bearer unavailable
- **WHEN** `GET /api/settings/ai` is not Bearer-capable for the client
- **THEN** the screen MUST NOT present a fake save path for persona/tool-approval; it MAY offer Open web for those fields while still allowing nickname/About me via profile when available

### Requirement: Save coach identity preferences
The Coach identity screen SHALL save nickname and About me via Bearer `PATCH /api/profile` (`profile:write`), and persona plus require-tool-approval via Bearer `POST /api/settings/ai` (`profile:write`) when available. Persona values MUST be the web enum: `Analytical`, `Supportive`, `Drill Sergeant`, `Motivational`.

#### Scenario: Successful save
- **WHEN** the user edits one or more coach identity fields and saves successfully
- **THEN** the client persists the changes and confirms success

#### Scenario: Save error
- **WHEN** a save request fails
- **THEN** the user sees an error and retained form values for correction

### Requirement: Lite subset only
The Coach identity screen MUST NOT expose AI model tier, automation toggles (auto-analyze, proactivity, deep analysis), voice/TTS settings, or usage/quota charts. Those remain web AI Coach settings.

#### Scenario: No automation controls
- **WHEN** the user opens Coach identity on mobile
- **THEN** they do not see model preference, auto-analyze, or TTS controls

