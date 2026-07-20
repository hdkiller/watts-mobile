## Why

Athletes maintain **per-sport** thresholds on web (FTP, LTHR, Max HR, and related fields per sport profile). Mobile Athlete metrics only edits the **default** profile via `PATCH /api/profile`, so multi-sport athletes cannot correct the numbers Coach Watts uses for a given sport while in the field. A **lite** Sports surface under **Settings** lets them bump per-sport thresholds without porting full Sport Settings (zones, detect-from-workouts, target policy) and without crowding the Log write tabs.

## What Changes

- Add **Settings → Sports** listing sport profiles from `GET /api/profile` (`sportSettings`); open a simple editor for **core thresholds per profile**: FTP, LTHR, Max HR (and threshold pace when already present on the payload).
- Save via `PATCH /api/profile` with a `sportSettings` upsert payload (`profile:write`), without exposing zone tables, indoor FTP / eFTP / W′, workout target defaults, activity-type remapping, or detect-from-workouts on mobile.
- Keep **Athlete metrics** (More → Athlete) as the quick default-profile editor with a pointer to Settings → Sports.
- Prominent **Open web** escape to Profile Settings → Sports for zones, detect-from-workouts, types mapping, and advanced fields.
- Out of scope (stay on web): zone editors, detect-from-workouts, indoor FTP / eFTP / W′ / Pmax, activity-type mapping, workout target policy, create/delete sport profiles, Measurements, availability, Connected Apps.
- **Not on Log:** Sports is not a Log segment (Log stays wellness / recovery / nutrition).

## Capabilities

### New Capabilities

- `log-sport-settings`: Settings → Sports — list sport profiles and edit lite per-sport thresholds (FTP / LTHR / Max HR [/ pace]); Open web for full Sport Settings. (Capability id kept; surface is Settings, not Log.)

### Modified Capabilities

- `athlete-profile-edit`: Athlete metrics remains default-profile quick edit; MUST clarify that per-sport threshold edits live on Settings → Sports.
- `account-more`: More / Athlete / Settings labeling MUST remain honest (metrics ≠ full sport-profile management).

## Impact

- **watts-mobile UI:** [`app/(app)/settings/sports.tsx`](app/(app)/settings/sports.tsx), [`app/(app)/sports/[id].tsx`](app/(app)/sports/[id].tsx), `src/features/sports/`; Settings hub row; no Log segment changes for Sports.
- **Data:** `sportSettings` from `GET /api/profile`; persist lite fields via `PATCH /api/profile` `{ sportSettings }`.
- **coach-wattz:** No new endpoints; `profile:read` / `profile:write`.
- **Docs:** lite per-sport thresholds under Settings; full Sport Settings remains web.
