# Native modules & dev client rebuilds

This app uses **`expo-dev-client`**, not Expo Go as the daily runtime. Adding or upgrading a package that ships **native code** (or changing its config plugin / permission strings in `app.json`) is not enough for Metro hot reload — the installed binary must be rebuilt so autolinking can include the module.

## When you must rebuild

Rebuild after any of:

- `pnpm add` / `expo install` of a package with iOS/Android native code (e.g. `expo-image-picker`, `expo-notifications`, `@sentry/react-native`, `react-native-svg`, HealthKit later)
- New or changed **config plugin** entries in `app.json` (permissions, associated domains, splash, etc.)
- Changes under `ios/` / `android/` that aren’t pure JS

JS-only dependency bumps do **not** need a native rebuild.

## Commands

```bash
# Preferred — reinstalls pods / Gradle deps and installs a fresh binary
pnpm ios          # npx expo run:ios
pnpm android      # npx expo run:android

# Or EAS development client
eas build -p ios --profile development
```

If pods look stale after a native package add:

```bash
npx pod-install ios
pnpm ios
```

Confirm the module appears in `ios/Podfile.lock` (e.g. `ExpoImagePicker`) before assuming the JS side is wrong.

## Symptom

Runtime error like:

```text
Cannot find native module 'ExponentImagePicker'
```

usually means the **JS bundle imports a module the current binary never linked**. Fix: rebuild; do not chase app logic first.

Prefer lazy/`require` + a friendly “rebuild needed” message for optional media APIs so a missing native module does not crash an entire tab on import (see `src/features/coach/attachments.ts`). Still rebuild before calling the feature done.

## Related

- [deep-links.md](./deep-links.md) — rebuild after associated domains / intent filters change
- [coach-chat-sessions-smoke.md](./coach-chat-sessions-smoke.md) — photo attach needs a binary that includes `expo-image-picker`
