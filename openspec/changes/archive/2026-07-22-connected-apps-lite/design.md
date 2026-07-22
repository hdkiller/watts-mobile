## Context

Web Connected Apps (`/settings/apps`) owns OAuth authorize/callback for Garmin, Oura, WHOOP, Strava, Intervals.icu, and more. Provider redirect URIs are registered to coach-wattz (e.g. Garmin → `/api/integrations/garmin/callback`). Mobile product baseline kept that surface on web; Health Sync (HealthKit / Health Connect) is a separate phone-local ingest path now shipping in `health-platform-ingest`.

Athletes still expect “Connect Garmin” from the companion. Session handoff (`openInstanceWeb`) already signs the system browser into the instance. `GET /api/integrations/status` returns connection rows but today uses `getServerSession` only — companion Bearer cannot call it.

## Goals / Non-Goals

**Goals:**
- Native lite status list for primary Coach Watts integrations under Settings.
- Connect / Fix / Manage via handoff to web (no native provider OAuth).
- Clear distinction between Health Sync (this phone) and Connected Apps (Coach Watts server sync).
- Settings hub entry with a useful status detail.
- coach-wattz: Bearer-readable integrations status with an existing companion scope.

**Non-Goals:**
- Native OAuth per provider or new mobile redirect URI registrations.
- Native disconnect, sync-now, ingest toggles, source-conflict / ingestion settings UI.
- Full parity with every web Connected Apps card (Liftosaur, Yazio, Telegram, OAuth apps list, etc.).
- Replacing or merging Health Sync into Connected Apps.
- Full day-one onboarding audit (issue 056) — only an optional thin CTA into this screen.

## Decisions

1. **Status in-app, OAuth in browser**  
   Mobile reads status; all connect/reconnect/manage mutations stay on web via `openInstanceWeb('/settings/apps')` (or provider-specific authorize path when safe).  
   **Why:** Reuses registered callbacks, PKCE cookies, and web UX.  
   **Alt:** Native OAuth per provider — rejected (redirect URI + verifier + maintenance cost).  
   **Alt:** In-app WebView of settings — rejected (auth/cookie fragility; handoff + system browser is already the pattern).

2. **Bearer on `GET /api/integrations/status` via `requireAuth(..., ['profile:read'])`**  
   Switch session-only guard to unified `requireAuth` with `profile:read` (companion already requests it). Connection status is account metadata, not a new sensitive write.  
   **Why:** No new OAuth scope; matches “read my account setup.”  
   **Alt:** New `integrations:read` scope — cleaner taxonomy but forces scope migration / re-consent.  
   **Alt:** Mint handoff and scrape web — absurd.

3. **Curated provider list (not raw status dump)**  
   Always show a fixed primary set, merged with status by `provider` key:

   | Provider key   | Label         |
   |----------------|---------------|
   | `garmin`       | Garmin        |
   | `whoop`        | WHOOP         |
   | `oura`         | Oura          |
   | `strava`       | Strava        |
   | `intervals`    | Intervals.icu |
   | `polar`        | Polar         |
   | `wahoo`        | Wahoo         |
   | `fitbit`       | Fitbit        |
   | `withings`     | Withings      |

   Rows without a matching integration = Not connected. Unknown / OAuth-app consent rows from the API are ignored on this screen. Footer: “Manage all Connected Apps” → handoff `/settings/apps`.  
   **Why:** Day-one athletes see Connect targets even before any row exists; avoids dumping third-party OAuth apps into the list.  
   **Alt:** Only show API-returned rows — poor empty state.

4. **Row actions**  
   - Not connected → **Connect** → `openInstanceWeb('/settings/apps')` (web owns the right authorize entry; avoids duplicating per-provider URL rules and disabled flags).  
   - Connected (ok) → **Manage** → same path.  
   - Error / failed sync → **Fix** → same path (primary); detail line shows `errorMessage` or sync status when present.  
   **Why:** One reliable destination; web already handles disabled providers and authorize quirks.  
   **Alt:** Deep-link each `/api/integrations/{p}/authorize` — faster connect but brittle (session cookies on authorize GET, disabled providers, Auth.js Strava path). Defer unless UX proves the apps page is too heavy.

5. **Health Sync band on the same screen**  
   Top section: “On this phone” → Health Sync status summary + navigate to existing Health Sync settings. Below: “Coach Watts Connected Apps” curated list. Short copy that phone health and server integrations are different pipes.  
   **Why:** Prevents “I already have Oura in Apple Health, why connect again?” confusion without merging systems.

6. **Module layout**  
   - Route: `app/(app)/(tabs)/more/settings/connected-apps.tsx`  
   - Feature: `src/features/integrations/` — `fetchIntegrationStatus`, types, provider catalog, `useIntegrationStatus` query hook  
   - Settings hub MenuRow in General (near Health Sync)  
   - Refetch on screen focus after returning from browser (AppState / useFocusEffect)

7. **Optional Today CTA**  
   If integrations status loads and **zero** curated providers are connected, Today MAY show a single secondary “Connect a device” row that navigates to Connected Apps lite (not a handoff jump). Full first-run sequence remains issue 056.

8. **Older self-hosted instances**  
   If status returns 404/401/5xx, screen shows honest error + **Open Connected Apps on web** handoff fallback (same as other Open web escapes).

## Risks / Trade-offs

- **[Risk] Status endpoint still session-only on old self-hosted builds** → Mitigation: graceful error + handoff; document coach-wattz deploy dependency.  
- **[Risk] Athletes think Connect finished when they only opened the browser** → Mitigation: refetch on focus; status detail updates when they return after completing OAuth.  
- **[Risk] `profile:read` feels broad for integrations** → Mitigation: read-only; no tokens returned in status payload today — keep it that way (never expose provider access tokens to mobile).  
- **[Trade-off] Connect always lands on full apps page** → Extra tap on web vs deep authorize; acceptable for v1 lite.  
- **[Trade-off] Curated list lags new providers** → Footer “Manage all” covers newcomers until catalog updated.

## Migration Plan

1. Ship coach-wattz `requireAuth` + `profile:read` on `GET /api/integrations/status`; deploy hosted.  
2. Ship mobile screen + Settings entry; works against new API, degrades with handoff on old instances.  
3. Update `docs/product-baseline.md` Settings hub line; note decision in `docs/open-questions.md` if needed.  
4. Optional Today CTA in same change or immediate follow-up.

## Open Questions

- Whether a later pass should deep-link Connect to provider authorize URLs for the happy path (keep apps page for Manage/Fix).  
- Whether Ultrahuman / Rouvy / Liftosaur belong on the curated list for v1 (default: no — Manage all).  
- Exact Today empty-state copy vs broader issue 056 work (default: one secondary CTA only if zero connected).
