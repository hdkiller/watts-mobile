## Why

Athletes expect to connect Garmin, Oura, WHOOP, and similar services from the companion — especially on day one when Today is empty without a device feed. Full Connected Apps OAuth and sync controls stay on web (control room), but the app should show connection status and start Connect / Fix / Manage via the existing Bearer→cookie handoff so the loop feels in-app without reimplementing provider OAuth.

## What Changes

- Add a **Connected Apps (lite)** Settings screen: list key wearable / activity providers with connected / not connected / error status and last sync when available.
- **Connect**, **Fix**, and **Manage** actions open the web Connected Apps surface (or provider authorize path) via `openInstanceWeb` handoff — no native provider OAuth.
- Surface **Health Sync** on the same screen as a distinct phone-local path (link to existing Health Sync settings), so athletes can tell “on this phone” from “Coach Watts Connected Apps.”
- Add a Settings hub entry (General) with a short status detail (e.g. “3 connected” / “None connected”).
- **coach-wattz:** allow `GET /api/integrations/status` (or equivalent) for companion Bearer auth with an existing scope (likely `profile:read`); today it is session-only.
- Update product docs / settings-hub non-goal wording: lite status + handoff is in scope; full sync prefs, disconnect UI, source conflicts, and billing remain Open web.
- Optional thin empty-state CTA on Today pointing at Connected Apps lite (ties to day-one setup) — same handoff/actions, no separate onboarding system.

## Capabilities

### New Capabilities
- `connected-apps-lite`: Native status list for Coach Watts integrations, handoff-based Connect/Fix/Manage, and clear separation from Health Sync.

### Modified Capabilities
- `settings-hub`: Add Connected Apps entry; relax “MUST NOT implement Connected Apps” to allow this lite status surface while full control-room Connected Apps stay on web.
- `app-web-session-handoff`: No requirement change expected (existing `returnTo` to `/settings/apps` is enough). Listed only if design discovers a gap — leave unmodified unless needed.

## Impact

- **Mobile:** new Settings route + feature module under `src/features/integrations/` (or similar); Settings hub menu row; TanStack Query against integrations status; reuse `openInstanceWeb`.
- **coach-wattz (required dependency):** Bearer support on integrations status (switch `getServerSession` → `requireAuth` with `profile:read` or documented equivalent). No new OAuth scopes if `profile:read` is accepted.
- **Out of scope:** native Garmin/Oura/WHOOP/Strava OAuth; native disconnect/sync-now/ingest toggles; source-conflict editors; replacing Health Sync; full web Connected Apps port.
- **Docs:** `docs/product-baseline.md` Settings hub line; optionally note day-one CTA vs issue 056 full first-run audit.
