## Why

Athletes expect the Same Athlete Profile AI report experience they get on web (dashboard widget → Sync → full report at `/profile/athlete`). Mobile already shows identity, HR thresholds, executive summary, and Sync when Bearer reports work — but many sessions hit **403** (stale token missing `profile:read` / `profile:write`), get a vague “opens on the web” message with Sync hidden, or cannot reliably open the full report. That feels broken next to web’s Sync + report page.

## What Changes

- Improve **AI report access UX** on More → Athlete:
  - On 401/403: explicit **Sign out & re-login** CTA (scope refresh) plus Open web — not a dead “opens on the web” dead-end.
  - When a completed report exists: keep executive summary; make **Open full report** the primary escape for multi-section depth (via session handoff).
  - When no report: clearer empty + Sync (or Open web if generate forbidden).
- Optionally add a lightweight **in-app report sheet** for the latest report body sections already returned by `GET /api/reports` / `[id]` (executive + key sections) so athletes are not forced to browser for a first read — still Open web for history picker / share / regenerate chrome.
- Ensure Sync / reports error paths surface quota (429) and generating timeout honestly.
- Document that existing sessions need re-consent after `profile:read` / `profile:write` were added to companion scopes.

## Capabilities

### New Capabilities

- _(none required)_ — polish of overview + optional report sheet.

### Modified Capabilities

- `athlete-profile-overview`: Forbidden/unavailable report states MUST offer re-auth; Open full report MUST use instance handoff; MAY offer a lite in-app report sheet for the latest COMPLETED report.
- `account-more`: Athlete entry still leads to overview; no IA change beyond clearer report affordances.

## Impact

- **watts-mobile:** `AthleteProfileOverview.tsx`, `athleteReport.ts`, optional `AthleteReportSheet.tsx`, sign-out navigation, docs/oauth-setup + open-questions.
- **coach-wattz:** none if reports/generate already Bearer (`profile:read` / `profile:write`); verify no remaining session-only gaps.
- **Out of scope:** full web Athlete Profile page port (historical date picker, share cards, nutrition/recovery deep sections parity), regenerating from More without overview, Training Load inside Athlete card (stays on Today).
