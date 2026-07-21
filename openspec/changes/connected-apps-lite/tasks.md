## 1. coach-wattz API

- [x] 1.1 Update `GET /api/integrations/status` to authenticate via `requireAuth(event, ['profile:read'])` instead of session-only `getServerSession`, preserving the existing response shape
- [x] 1.2 Confirm the status payload never includes provider access/refresh tokens; add/adjust a unit test for Bearer `profile:read` success and missing-scope 403
- [x] 1.3 Deploy or make the change available on the instance used for companion testing (hosted / local)

## 2. Mobile data layer

- [x] 2.1 Add `src/features/integrations/` types, curated provider catalog, and `fetchIntegrationStatus` using the existing API client + Bearer
- [x] 2.2 Add `useIntegrationStatus` (TanStack Query) with focus/AppState refetch suitable for return-from-browser
- [x] 2.3 Map API rows onto the curated catalog (connected / not connected / error + last sync / error message); ignore OAuth-app consent rows

## 3. Connected Apps lite UI

- [x] 3.1 Add Settings stack route `connected-apps` and screen with Health Sync band + curated provider list + Manage all footer
- [x] 3.2 Wire Connect / Fix / Manage / Manage all / error-fallback to `openInstanceWeb` targeting `/settings/apps`
- [x] 3.3 Wire Health Sync band to the existing Health Sync settings route; show a short distinct-pipes explanation
- [x] 3.4 Handle loading, empty-catalog (all not connected), and status-unavailable error states

## 4. Settings hub entry

- [x] 4.1 Add Connected Apps MenuRow in Settings General (near Health Sync) with status detail (e.g. “N connected” / “None connected” / em dash while loading)
- [x] 4.2 Register the stack screen title in settings `_layout.tsx`

## 5. Optional Today cue

- [x] 5.1 When status is available and zero curated providers are connected, add a single secondary “Connect a device” cue on Today that navigates to Connected Apps lite (does not replace the hero)

## 6. Docs and verification

- [x] 6.1 Update `docs/product-baseline.md` Settings hub line to include Connected Apps lite (full editors stay web)
- [x] 6.2 Record the decision in `docs/open-questions.md` if a tracked question exists; otherwise skip
- [ ] 6.3 Smoke: Settings → Connected Apps shows status; Connect opens handed-off web apps page; after connecting on web and returning, row updates; Health Sync band opens Health Sync; older-instance failure still offers Open web
