# 015 — Android production AAB + upload

**Area:** build · **Priority:** medium · **Status:** open

**Depends on:** [011](./011-play-console-app.md), [014](./014-eas-android-credentials.md)

## Goal

Produce a signed Play AAB and land it on an internal/closed testing track.

## Steps

1. [ ] Build: `eas build -p android --profile production` (AAB for Play).
2. [ ] Upload via `eas submit -p android --profile production` or Play Console manual upload.
3. [ ] Assign build to **Internal testing** track first (fastest feedback).
4. [ ] Log versionCode / versionName + EAS build URL in [log.md](../log.md).
5. [ ] Verify adaptive icon + splash on a physical device ([../../store-checklist.md](../../store-checklist.md)); notification accent `#00DC82` after notifications plugin rebuild.

## Done when

- AAB is on Internal testing and installable by testers.
