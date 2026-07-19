## 1. Route contract

- [ ] 1.1 Finalize path map against Expo Router file routes
- [ ] 1.2 Document AASA / assetlinks hosting requirements for coach-wattz
- [ ] 1.3 Align push payload `path` examples with the map

## 2. Linking implementation

- [ ] 2.1 Configure Expo Router linking for `coachwatts` scheme paths (non-OAuth)
- [ ] 2.2 Implement shared path resolver used by links and push handler
- [ ] 2.3 Preserve return path across login for cold-start links
- [ ] 2.4 Add associated domains / intent filters config stubs for when hosts are ready

## 3. Host pairing (coach-wattz / infra)

- [ ] 3.1 Serve `apple-app-site-association` for production host
- [ ] 3.2 Serve Android Digital Asset Links
- [ ] 3.3 Smoke https link → app open on device when association is live

## 4. Verify

- [ ] 4.1 Manual scheme smoke for Today, notifications, coach, activity paths
- [ ] 4.2 Confirm push `data.path` uses shared resolver
- [ ] 4.3 Update docs (implementation-plan + oauth/deep-link notes)
