## 1. API client and mapping

- [ ] 1.1 Add types + fetcher for `GET /api/profile/dashboard` (map `recentSleep`, `recentHRV`, `restingHr`, `latestWellnessDate`, `hasCurrentDayWellness`)
- [ ] 1.2 Add types + fetcher for `GET /api/wellness/trend?startDate&endDate` (7-day window ending on latest wellness date or local today)
- [ ] 1.3 Port `calculateTrend` (current vs mean of prior values; higher/lower-is-better) with unit tests including the RHR “-2%” style case
- [ ] 1.4 Compose `useRecentWellnessQuery` (or equivalent) with TanStack Query; do not block Today’s recommendation query

## 2. Recent Wellness glance UI

- [ ] 2.1 Build `RecentWellnessGlance` tile row (Sleep / HRV / RHR only) with units, omit-per-null metric, trend % badge, stale caption
- [ ] 2.2 Empty state: always show section with “No recent wellness · Check in” when all three metrics absent
- [ ] 2.3 Distinct Check in control → Log tab wellness section (including from empty state)
- [ ] 2.4 Wire glance onto Today near Active Recovery Context; keep first-viewport decision composition; load independently of recommendation

## 3. Inline 7-day bars

- [ ] 3.1 Expand/collapse control on the glance (bars collapsed by default)
- [ ] 3.2 Compact 7-day bar rows for Sleep / HRV / RHR from the same trend series; omit per-metric when empty
- [ ] 3.3 No new chart library; no Wellness Overview modal

## 4. Replace AI biometric strip

- [ ] 4.1 Remove recommendation-`analysisJson` Sleep/HRV/Feel `RecoveryMetricTile` strip from Today
- [ ] 4.2 Update `mapTodayPayload` / tests so AI recovery biometrics are no longer required for Today layout
- [ ] 4.3 Confirm recommendation rationale/hero still surfaces subjective readiness language when present

## 5. Docs and verification

- [ ] 5.1 Record locked decisions in `docs/open-questions.md` decision log
- [ ] 5.2 Manual QA: wearable wellness, check-in-only sleep, stale yesterday, empty + Check in, expand/collapse bars, recommendation absent but wellness present, offline/error on dashboard/trend
- [ ] 5.3 Confirm scopes `profile:read` + `health:read` already granted for existing sessions
