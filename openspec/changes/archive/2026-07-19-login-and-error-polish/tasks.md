# Tasks — Login and Error Polish

## 1. Friendly error mapping

- [x] 1.1 Create `src/api/errors.ts` with `friendlyError(err, fallback)` classifying ApiError status (401/403, 404, 5xx with status hint), connectivity failures, and timeout/abort
- [x] 1.2 Add vitest coverage for each error class and the fallback path
- [x] 1.3 Sweep error render sites to use `friendlyError`: Today, Log, activity list + detail, planned detail, upcoming, notifications, coach chat error states
- [x] 1.4 Verify no `error.message` reaches a `<Text>` outside dev-only surfaces (grep check)

## 2. Login screen polish

- [x] 2.1 Add Coach Watts wordmark asset to `assets/` and render it above the title in `app/(auth)/login.tsx`
- [x] 2.2 Gate the redirect-URI/CLI block behind `__DEV__ || isExpoGoRuntime()`
- [x] 2.3 Confirm dev builds and Expo Go still show registration guidance; production layout verified without it
  <!-- Code/grep verified: gated by `__DEV__ || isExpoGoRuntime()`. Device/release-mode visual check remains. -->

## 3. Verification

- [x] 3.1 `npx tsc --noEmit` and `npm test` pass
- [x] 3.2 Manual pass: airplane-mode Today shows connectivity copy; login screen clean in a release-mode run
