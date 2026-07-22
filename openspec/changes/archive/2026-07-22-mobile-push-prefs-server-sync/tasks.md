## 1. Prefs client

- [x] 1.1 Align `DEFAULT_PREFERENCES` with server (`SYNC_COMPLETED: false`)
- [x] 1.2 Make PUT failure fail the mutation (no silent local-only success when API is reachable); update cache from successful response
- [x] 1.3 Keep SecureStore as cache after successful GET/PUT; document 404 local-only fallback for old instances
- [x] 1.4 Unit tests for defaults + parse/merge of server prefs payload

## 2. Settings UI

- [x] 2.1 Remove or permanently disable Sync Status row (prefer remove)
- [x] 2.2 Update helper copy to account-level push alerts (not “this device only”)
- [x] 2.3 Confirm error banner still shows on failed save

## 3. Registration (optional)

- [x] 3.1 If cheap, attach current prefs on `POST /api/mobile/devices` after load; otherwise skip

## 4. Verification

- [x] 4.1 Against a coach-wattz build with 364/365: toggle Rec off → no Expo on AUTOMATIC recommend; toggle on → push arrives
- [x] 4.2 Fresh install / cleared SecureStore: GET shows `SYNC_COMPLETED` false and no Sync toggle
- [x] 4.3 Mark pu-005 / inventory if any client-facing status notes need a date stamp
