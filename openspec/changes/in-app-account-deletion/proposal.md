## Why

Apple App Store Guideline 5.1.1(v) and Google Play Account Deletion Policy require that apps with account creation allow users to initiate account deletion directly within the app. Currently, tapping "Delete account" in Settings opens the web URL `/settings/danger` via `expo-web-browser`. If the browser session is unauthenticated, the user is stranded on a web login screen, triggering store reviewer rejections. An explicit native deletion confirmation and seamless authenticated handoff to account deletion are required to guarantee approval.

## What Changes

- Add a native in-app account deletion confirmation sheet/dialog in Settings (`More -> Settings`).
- Implement authenticated web handoff (`/api/auth/handoff` token exchange) so opening the web Danger Zone guarantees an active logged-in session on the account deletion confirmation page.
- Alternatively, support native API deletion trigger against `DELETE /api/profile` on supported instances.
- Automatically execute full client device cleanup (`signOut()`, wipe SecureStore, clear TanStack Query cache, reset navigation) when account deletion is confirmed or completed.

## Capabilities

### New Capabilities
- `in-app-account-deletion`: Native in-app account deletion confirmation modal, authenticated web handoff for deletion, and immediate local session purge.

### Modified Capabilities
- None.

## Impact

- **Mobile UI**: `app/(app)/(tabs)/more/settings/index.tsx`
- **Account & Auth**: `src/features/account/openInstanceWeb.ts`, `src/features/account/paths.ts`, `src/auth/AuthContext.tsx`
- **Backend API**: `coach-wattz` `DELETE /api/profile` and `/api/auth/handoff`
