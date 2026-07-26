## 1. Native Account Deletion UI & Confirmation

- [x] 1.1 Update `app/(app)/(tabs)/more/settings/index.tsx` `handleDeleteAccount` to present an explicit native warning modal detailing permanent data removal.
- [x] 1.2 Add destructive confirmation trigger in Settings.

## 2. Authenticated Web Handoff & Session Cleanup

- [x] 2.1 Enhance `openInstanceWeb` in `src/features/account/openInstanceWeb.ts` to request an auth handoff token before launching `expo-web-browser` to `/settings/danger`.
- [x] 2.2 Add immediate `signOut()` and `queryClient.clear()` call upon confirmed account deletion to wipe local tokens and state.

## 3. Verification & Tests

- [x] 3.1 Write unit tests for deletion confirmation flow and auth handoff path in `src/features/account/__tests__/paths.test.ts`.
- [x] 3.2 Run typecheck and test suite to confirm zero regressions.
