## 1. API client and mapping

- [x] 1.1 Add types + fetcher for `GET /api/profile/dashboard` (map `recentSleep`, `recentHRV`, `restingHr`, `latestWellnessDate`, `hasCurrentDayWellness`)
- [x] 1.2 Add types + fetcher for `GET /api/wellness/trend?startDate&endDate` (7-day window ending on latest wellness date or local today)
- [x] 1.3 Port `calculateTrend` (current vs mean of prior values; higher/lower-is-better) with unit tests including the RHR “-2%” style case
- [x] 1.4 Compose `useRecentWellnessQuery` (or equivalent) with TanStack Query; do not block Today’s recommendation query

## 2. Recent Wellness glance UI

- [x] 2.1 Build `RecentWellnessGlance` tile row (Sleep / HRV / RHR only) with units, omit-per-null metric, trend % badge, stale caption
- [x] 2.2 Empty state: always show section with “No recent wellness · Check in” when all three metrics absent
- [x] 2.3 Distinct Check in control → Log tab wellness section (including from empty state)
- [x] 2.4 Wire glance onto Today near Active Recovery Context; keep first-viewport decision composition; load independently of recommendation

## 3. Trends via Wellness Overview (supersedes inline bars)

- [x] 3.1 Tap glance tiles opens Wellness Overview sheet (not inline expand) — locked 2026-07-20
- [x] 3.2 7-day bar rows live in Wellness Overview sheet from the same trend series
- [x] 3.3 No new chart library on the glance itself

## 4. Replace AI biometric strip

- [x] 4.1 Remove recommendation-`analysisJson` Sleep/HRV/Feel strip from Today UI
- [x] 4.2 Keep `mapRecoveryStrip` for coach seed context; Today layout no longer requires AI recovery tiles
- [x] 4.3 Confirm recommendation rationale/hero still surfaces subjective readiness language when present

## 5. Docs and verification

- [x] 5.1 Record locked decisions in `docs/open-questions.md` decision log
- [x] 5.2 Manual QA covered by shipped glance + overview sheet paths
- [x] 5.3 Confirm scopes `profile:read` + `health:read` already in `COMPANION_SCOPES`
