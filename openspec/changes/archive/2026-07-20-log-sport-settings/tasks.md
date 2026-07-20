## 1. API contract & types

- [x] 1.1 Confirm `sportSettings` shape on `GET /api/profile` and lite-field PATCH upsert (round-trip one profile; change FTP/LTHR/Max HR only)
- [x] 1.2 Add types + parsers for sport profile list / lite form under `src/features/sports/`
- [x] 1.3 Add query/mutation hooks reusing profile fetch + `PATCH /api/profile` `{ sportSettings }`

## 2. Settings surface (not Log)

- [x] 2.1 Add Settings → Sports screen listing profiles
- [x] 2.2 Register stack routes for settings/sports + sports/[id] editor
- [x] 2.3 Ensure Log chrome has no Sports segment / Log defaults has no Sports option

## 3. Sports list + lite editor

- [x] 3.1 Settings → Sports list: name, default badge, FTP / LTHR / Max HR summary
- [x] 3.2 Loading / empty / error + retry; Open web affordance for full Sport Settings
- [x] 3.3 Editor: FTP, LTHR, Max HR (+ threshold pace when present); save; `useKeyboardOverlap`
- [x] 3.4 Unit tests for parsers / payload mapper

## 4. Coexistence & docs

- [x] 4.1 Athlete metrics helper copy + pointer to Settings → Sports
- [x] 4.2 Update `docs/open-questions.md` (and baseline note): lite per-sport thresholds under Settings
- [x] 4.3 Invalidate profile-related queries after save
