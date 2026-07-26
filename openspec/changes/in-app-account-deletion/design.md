## Context

Apple App Store Review Guideline 5.1.1(v) requires apps that support account creation to allow account deletion within the app. On Coach Watts, account deletion triggers a Trigger.dev background job (`delete-user-account`) and deletes the athlete's data via `DELETE /api/profile` on the backend (`coach-wattz`). Currently, the mobile app shows a generic alert and opens `/settings/danger` via `expo-web-browser`. If the web browser session is unauthenticated, the athlete lands on a web login screen, which triggers App Store reviewer rejections.

## Goals / Non-Goals

**Goals:**
- Provide a native, explicit confirmation dialog in `Settings -> Delete account` detailing what data will be deleted.
- Implement authenticated web handoff (`/api/auth/handoff`) so opening `/settings/danger` guarantees the athlete is logged in directly on the account deletion confirmation page.
- Support direct native `DELETE /api/profile` execution where supported by the instance.
- Automatically wipe all local tokens (`expo-secure-store`), invalidate TanStack Query caches, and route to `/(auth)/login` upon deletion confirmation.

**Non-Goals:**
- Reimplementing complex backend billing cancellation forms or survey workflows in native UI.

## Decisions

### 1. Native Confirmation Sheet & Impact Warning
- Tapping "Delete account" in Settings displays a dedicated native modal with clear warning copy detailing data removal (workouts, wellness history, recommendations, health sync links).
- Destructive action button labeled "Permanently Delete Account".

### 2. Authenticated Web Handoff & Direct API Fallback
- `openInstanceWeb` will use `/api/auth/handoff` to pass a short-lived one-time login token so `expo-web-browser` opens `/settings/danger` already authenticated.
- If direct deletion is preferred, `DELETE /api/profile` is invoked via `apiFetch`.

### 3. Immediate Client Session Purge
- Calling `signOut()` immediately revokes refresh tokens, deletes SecureStore keys (`accessToken`, `refreshToken`, `instanceUrl`), wipes TanStack Query cache, and redirects the navigator to `/(auth)/login`.

## Risks / Trade-offs

- [Unauthenticated Web Session] → Mitigated by generating a single-use `/api/auth/handoff` URL before launching `expo-web-browser`.
- [Stale Local Data] → Mitigated by calling `queryClient.clear()` and `signOut()` immediately upon account deletion confirmation.
