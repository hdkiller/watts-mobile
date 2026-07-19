## 1. Types and mappers

- [x] 1.1 Extend workout/planned API + view types for summary metrics, workIntensity, coach cues, and zone summary
- [x] 1.2 Implement format helpers and mappers in `mapActivity.ts` (metrics, IF, status labels, coachInstructions, zoneProfileSnapshot)
- [x] 1.3 Add/extend unit tests in `mapActivity.test.ts` for present, absent, and edge cases

## 2. Past activity UI

- [x] 2.1 Render optional Summary metrics section on `activity/[id].tsx` when mapped metrics exist
- [x] 2.2 Keep streams-off fetch and Open web CTA unchanged

## 3. Planned detail UI

- [x] 3.1 Show workIntensity + completion/sync status on `planned/[id].tsx` when present
- [x] 3.2 Show Coach cues and compact Zones sections when mapped data exists
- [x] 3.3 Keep structure list + Open web CTA; omit empty sections

## 4. Verify

- [x] 4.1 Run activity mapper unit tests
- [x] 4.2 Sanity-check TypeScript / lints on touched files
