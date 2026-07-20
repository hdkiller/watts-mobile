# Native modules & dev client rebuilds

This app uses **`expo-dev-client`**, not Expo Go as the daily runtime. Adding or upgrading a package that ships **native code** (or changing its config plugin / permission strings in `app.json`) is not enough for Metro hot reload — the installed binary must be rebuilt so autolinking can include the module.

## When you must rebuild

Rebuild after any of:

- `pnpm add` / `expo install` of a package with iOS/Android native code (e.g. `expo-haptics`, `expo-image-picker`, `expo-notifications`, `expo-widgets`, `@kingstinct/react-native-healthkit`, `react-native-health-connect`, `@sentry/react-native`, `react-native-svg`, `react-native-maps`)
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

## Free Personal Team — stripped device builds

A free Apple ID cannot provision Push, Associated Domains, HealthKit, or App Groups.
Until the paid Watt Mind org membership is active, use a capability-stripped iOS binary on a physical device; keep the full app on the simulator.

```bash
# Regenerate ios/ without paid entitlements (required when switching modes)
pnpm ios:free-team:prebuild

# Install Debug on a connected iPhone (needs Metro / laptop for day-to-day JS)
pnpm ios:free-team:device

# Install Release on a connected iPhone — JS bundled in; works unplugged on-the-go
pnpm ios:free-team:device:release
```

These scripts set `IOS_FREE_TEAM=1`, which `app.config.ts` uses to drop those capabilities and skip the `expo-notifications`, `expo-widgets`, and HealthKit config plugins. Push, universal links, Health prefill, and the home-screen widget are unavailable on that binary; other flows still work.

**Release + free team notes:** the app is still signed with your Personal Team development identity (not App Store). Free provisioning expires after **7 days** — reinstall when iOS says the app is no longer available. Prefer Debug while iterating; use Release when you want to leave the laptop behind.

Switching back to the full app (simulator or paid team):

```bash
# Important: clean prebuild without IOS_FREE_TEAM so entitlements return
npx expo prebuild --platform ios --clean
pnpm ios
```

If pods look stale after a native package add:

```bash
npx pod-install ios
pnpm ios
```

Confirm the module appears in `ios/Podfile.lock` (e.g. `ExpoImagePicker`) before assuming the JS side is wrong.

## Xcode 26 / iOS 26 SDK link quirks (July 2026)

`ios/Podfile`'s `post_install` carries two workarounds for linking `CoachWatts.debug.dylib` on Xcode 26; both regenerate on every `pod install`, so don't remove them casually. **Note `/ios` is gitignored** — these edits live only on the machine and are lost on `expo prebuild --clean`; if they need to be permanent, port them to a config plugin.

- **SwiftUICore / UIUtilities Swift autolink is disabled** (`-disable-autolink-framework`). SwiftUICore is private (not an allowed client); UIUtilities ships headers-only. Their symbols reach us via SwiftUI/UIKit.
- **Stub `.tbd`s in `ios/XcodeCompat/`** for `UIUtilities` and `CoreAudioTypes`. UIKit's *clang* module embeds `-framework UIUtilities` autolink hints in every ObjC object file, and the SDK ships no linkable stub for these headers-only frameworks. The stubs' install-names point at UIKit/CoreFoundation, so nothing changes at runtime.

## Prebuilt debug/release flavor mismatches (July 2026)

Both React Native core (`RCT_USE_PREBUILT_RNCORE`) and the precompiled Expo modules (`EXPO_USE_PRECOMPILED_MODULES`) ship **debug and release flavors** of their xcframeworks. A Debug app must use debug flavors everywhere — mixed flavors cause two distinct failures we hit:

1. **Link failure**: undefined symbols like `RCTReconnectingWebSocket`, `facebook::react::Sealable`, or `ShadowNode::getDebug*` at the `CoachWatts.debug.dylib` link mean the **release** flavor of the prebuilt React core is installed (debug is ~131 MB, release ~24 MB — check `ios/Pods/React-Core-prebuilt/.../React.framework/React`). Fix:

   ```bash
   rm -rf ~/Library/Caches/CocoaPods/Pods/External/React-Core-prebuilt ios/Pods/React-Core-prebuilt
   npx pod-install ios
   ```

2. **Instant crash at launch** (`EXC_BAD_ACCESS` in `facebook::react::Props::Props()` under `ExpoModulesCore … registerNativeViews`): a precompiled Expo module (e.g. `ExpoModulesCore.xcframework`) is the **release** flavor while React core is debug — an ABI mismatch, since debug/release RN cores have different C++ object layouts. This happens when the `.last_build_configuration` state file lies, so the "[Expo] Switch XCFramework for build configuration" build phase short-circuits and never swaps flavors. Fix, then rebuild:

   ```bash
   find ios/Pods -name .last_build_configuration -delete
   ```

Rule of thumb: after any pod-cache weirdness, symbol errors, or unexplained startup crashes on this setup, suspect a stale flavor before touching app code — the cheap nuke is `rm -rf ios/Pods ~/Library/Caches/CocoaPods && npx pod-install ios`.

## Symptom

Runtime error like:

```text
Cannot find native module 'ExponentImagePicker'
```

usually means the **JS bundle imports a module the current binary never linked**. Fix: rebuild; do not chase app logic first.

Prefer lazy/`require` + a friendly “rebuild needed” message for optional media APIs so a missing native module does not crash an entire tab on import (see `src/features/coach/attachments.ts`). Still rebuild before calling the feature done.

## Expansion modules (2026-07)

| Package | Why rebuild |
|---------|-------------|
| `expo-haptics` | Key-moment haptics (PR #2) |
| `expo-widgets` + `@expo/ui` | iOS Today session home-screen widget (`TodaySessionWidget`) |
| `@kingstinct/react-native-healthkit` + `react-native-nitro-modules` | Log “Prefill from Health” (sleep + weight) on iOS |
| `react-native-health-connect` | Same prefill on Android |
| `@react-native-async-storage/async-storage` | Query persist + analysis-seen store (JS-native bridge; rebuild if autolinking misses it) |
| `react-native-maps` | Activity detail lite route map (`ActivityMap`); Apple Maps on iOS, Google Maps on Android |

**Maps notes:** Autolinking is enough for iOS (Apple Maps). Android uses Google Maps — if tiles stay blank in release/dev builds, set `android.config.googleMaps.apiKey` in `app.json` (or EAS secrets) and rebuild. `ActivityMap` lazy-requires the module and shows a rebuild hint when the binary is stale.

Widget App Group: `group.com.coachwatts.mobile`. Health data is never sent to Sentry/analytics — only to the wellness check-in when the athlete saves.

## Related

- [deep-links.md](./deep-links.md) — rebuild after associated domains / intent filters change
- [coach-chat-sessions-smoke.md](./coach-chat-sessions-smoke.md) — photo attach needs a binary that includes `expo-image-picker`
- [store-privacy-checklist.md](./store-privacy-checklist.md) — HealthKit / Health Connect declarations
