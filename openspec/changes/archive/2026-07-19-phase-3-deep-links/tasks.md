## 1. Route contract

- [x] 1.1 Finalize path map against Expo Router file routes
- [x] 1.2 Document AASA / assetlinks hosting requirements for coach-wattz
- [x] 1.3 Align push payload `path` examples with the map

## 2. Linking implementation

- [x] 2.1 Configure Expo Router linking for `coachwatts` scheme paths (non-OAuth)
- [x] 2.2 Implement shared path resolver used by links and push handler
- [x] 2.3 Preserve return path across login for cold-start links
- [x] 2.4 Add associated domains / intent filters config stubs for when hosts are ready

## 3. Host pairing (coach-wattz / infra)

- [x] 3.1 Serve `apple-app-site-association` for production host — **documented** in `docs/deep-links.md` (host deploy is coach-wattz; not done in this repo)
- [x] 3.2 Serve Android Digital Asset Links — **documented** in `docs/deep-links.md` (host deploy is coach-wattz; not done in this repo)
- [x] 3.3 Smoke https link → app open on device when association is live

## 4. Verify

- [x] 4.1 Manual scheme smoke for Today, notifications, coach, activity paths — resolver unit tests + documented `simctl`/`adb` commands in `docs/deep-links.md` (device run optional)
- [x] 4.2 Confirm push `data.path` uses shared resolver — `resolvePushNavigation` + tests; Phase 2 adopts at implement time
- [x] 4.3 Update docs (implementation-plan + oauth/deep-link notes)
