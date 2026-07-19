## Why

Push and share links must land on Today, recommendation, activity, or chat — never a dead inbox. Scheme `coachwatts` already exists for OAuth; product deep links and associated domains are still open.

## What Changes

- Map `coachwatts://` paths to Expo Router screens (Today, recommendation/planned detail, activity, chat, notifications)
- Handle cold-start and warm-start link opens
- Document required coach-wattz / hosting work for Universal Links (AASA) and Android App Links
- Align push payload `url` / `path` fields with the same route map
- **coach-wattz / hosting:** Serve `apple-app-site-association` and Digital Asset Links for production (and staging if used)

## Capabilities

### New Capabilities

- `deep-links`: Custom scheme + universal link path map, open handlers, push path alignment

### Modified Capabilities

- _(none — Phase 2 push stubs adopt this resolver at implement time; no main-spec delta until push-handling is archived)_

## Impact

- **watts-mobile:** Expo Router linking config; link parser; push handler reuse
- **coach-wattz / infra:** AASA + assetlinks hosting; path contract documented in companion plan
- **Out of scope:** App Clip, marketing site smart banners (optional later), E2E
