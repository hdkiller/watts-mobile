## Context

Web settings span two large surfaces:

1. `/profile/settings` — Basic, Sport, Measurements, Availability, Nutrition, Public Presence, Communication  
2. `/settings/*` — Connected Apps, AI Coach, Billing, Developer, Danger Zone  

Mobile already has an in-progress Settings hub (`app/(app)/settings/{index,notifications,health}`) with Notifications (push event toggles), Health Sync, and Instance — reached from More. Athlete metrics (weight/FTP/max HR/LTHR) live on a separate screen; full Profile Settings are explicitly out of scope (open-question #10).

Product rule: mobile is the field companion; configure/architect surfaces stay on web (`Open web`, improved by `app-web-session-handoff`).

**API reality today:**

| Concern | Endpoint | Auth |
|---|---|---|
| Units, timezone, nickname, `aiContext` | `GET`/`PATCH /api/profile` | Bearer `profile:read`/`profile:write` ✓ |
| Persona, `aiRequireToolApproval`, full AI prefs | `GET`/`POST /api/settings/ai` | Cookie session only ✗ |
| Data export | `GET /api/profile/export` | Bearer ✓ |
| Account delete | `DELETE /api/profile` | Cookie session only ✗ |
| Push prefs | mobile device registration prefs | Bearer ✓ (already) |

## Goals / Non-Goals

**Goals:**
- Thin Settings hub that owns device + daily-read prefs athletes change in the field
- Units/timezone edits that refresh companion formatting immediately
- Coach identity lite that affects Coach chat without porting AI automation/TTS
- Store-reachable Export / Delete via Open web (handoff when available)
- Explicit coach-wattz Bearer migration for AI settings lite fields

**Non-Goals:**
- Porting Sport / Availability / Measurements / Public Presence / Nutrition macros
- Editing email Communication prefs on mobile (push stays separate)
- Connected Apps, Billing, Developer, Danger Zone bulk wipes
- Native account deletion or in-app JSON export download
- Unifying push event keys with email preference taxonomy APIs
- Theme / appearance settings

## Decisions

1. **Settings hub IA (three sections)**  
   ```
   Settings
   ├─ General: Notifications · Health Sync · Units & locale · Instance
   ├─ Coach: Persona & identity (nickname, persona, About me, tool approval)
   └─ Account: Athlete metrics (link) · Export my data · Delete account · Open web Profile
   ```
   Sign out stays on More (primary account action). About/legal stays on More.  
   *Alternative:* Flat list of every row — harder to scan; reject.  
   *Alternative:* Nest Athlete metrics into Settings only and remove More row — keep More row for discoverability; Settings may deep-link to the same screen.

2. **Units & locale via existing profile PATCH**  
   Fields: `distanceUnits` (`Kilometers`|`Miles`), `weightUnits` (`Kilograms`|`Pounds`), `temperatureUnits` (`Celsius`|`Fahrenheit`), `timezone` (IANA string).  
   Load from `GET /api/profile`; save with `PATCH /api/profile` + `profile:write`.  
   On success, invalidate queries that format distances/weights (activity, athlete, nutrition, today).  
   *Alternative:* Local-only override — would diverge from web; reject.

3. **Timezone UX: picker of common IANA zones + search, not free text**  
   Prefer a searchable list (device timezone highlighted). Invalid/null server timezone → suggest device zone.  
   *Alternative:* Free-text IANA — error-prone on mobile.

4. **Coach identity: split across two APIs, one screen**  
   - Nickname + About me (`aiContext`) → `PATCH /api/profile` (already Bearer)  
   - Persona + require tool approval → `GET`/`POST /api/settings/ai` after Bearer migration  
   Single “Coach” settings screen; client fans out saves (or one “Save” that patches both).  
   *Alternative:* Extend `profileUpdateSchema` with `aiPersona` / `aiRequireToolApproval` — possible later; prefer reusing AI settings endpoint so web and mobile share one write path.  
   *Alternative:* Open web only for persona — weaker for Coach-tab users; reject for this change.

5. **coach-wattz: Bearer on AI settings (required)**  
   Migrate `GET /api/settings/ai` → `requireAuth(event, ['profile:read'])`  
   Migrate `POST /api/settings/ai` → `requireAuth(event, ['profile:write'])`  
   Keep cookie session users working via the same `requireAuth` path (session-or-Bearer). Mobile only sends the lite subset (`aiPersona`, `aiRequireToolApproval`, optionally `nickname`/`aiContext` if already supported there — prefer profile for those two to avoid dual-write confusion).  
   Document Official Mobile App scopes already include `profile:read`/`profile:write`.

6. **Export / Delete = Open web, not native**  
   Settings → Account rows open instance paths (e.g. `/settings/danger`) via shared Open web helper (handoff when `app-web-session-handoff` lands).  
   Rationale: delete is still cookie-session; export payload is large; Danger Zone UX and confirmations already exist on web; App Store account-deletion expectation is satisfied by a clear in-app path to delete.  
   *Alternative:* Native `DELETE` after Bearer migration — deferred; higher risk, little field value.

7. **Push vs email prefs stay separate**  
   Keep mobile push toggles on event keys (`RECOMMENDATION_READY`, …). Do not edit `/api/profile/email-preferences` from mobile in this change. Align copy/labels with Communication taxonomy where names overlap (e.g. workout analysis).  
   *Alternative:* Unified preference center — larger coach-wattz project; out of scope.

8. **Formalize existing hub screens in specs**  
   Notifications / Health Sync / Instance already exist in working tree; this change’s `settings-hub` spec is the contract so archive updates `account-more` / store docs correctly. Implementation work is additive (units, coach, account rows) plus IA polish.

## Risks / Trade-offs

- **[Risk] AI settings still cookie-only** → Mitigation: coach-wattz Bearer migration is a prerequisite task; ship Coach screen behind successful GET smoke or show Open web fallback.  
- **[Risk] Unit change doesn’t refresh all formatters** → Mitigation: centralize unit reads from profile query cache; invalidate broad keys (`['profile']`, activity, today).  
- **[Risk] Dual-write nickname (profile vs AI settings)** → Mitigation: mobile writes nickname/`aiContext` only via `PATCH /api/profile`; AI settings POST omits them.  
- **[Risk] Delete via web feels like a dead end without handoff** → Mitigation: depends on / pairs with `app-web-session-handoff`; until then, honest “you may need to sign in on web” copy.  
- **[Trade-off] No email prefs on mobile** → Athletes manage email on web; push is the companion channel.  
- **[Trade-off] No native export file** → Acceptable; Open web downloads .json.

## Migration Plan

1. coach-wattz: Bearer on `GET`/`POST /api/settings/ai`; smoke with Official Mobile App token.  
2. Mobile: Units & locale screen + profile field mapping + query invalidation.  
3. Mobile: Coach identity screen (profile + AI settings).  
4. Mobile: Settings hub sections + Account Open web rows; update More entry copy if needed.  
5. Docs: open-questions decision, product-baseline Settings bullet, store-checklist Account delete/export path.  
6. Rollback: hide new rows; existing Notifications/Health/Instance remain.

## Open Questions

- Exact web path for Export/Delete deep link (`/settings/danger` vs dedicated anchors).  
- Timezone list source (static curated list vs `Intl.supportedValuesOf('timeZone')` where available).  
- Whether Athlete metrics moves under Settings Account only, or stays as a More peer (lean: keep More peer + Settings link).  
- Persona enum labels: match web exactly (`Analytical` / `Supportive` / `Drill Sergeant` / `Motivational`).
