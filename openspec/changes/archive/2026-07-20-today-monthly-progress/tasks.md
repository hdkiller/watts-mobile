## 1. API client and mapping

- [x] 1.1 Types + fetcher for `GET /api/stats/monthly-comparison?sport=`
- [x] 1.2 Types + fetcher for `GET /api/workouts/sports` (sport filter)
- [x] 1.3 Map current/last series, footer totals, delta %; unit tests

## 2. Glance + sheet UI

- [x] 2.1 `MonthlyProgressGlance` — total + delta %; loading/empty/error
- [x] 2.2 Sheet with metric / sport / Cumulative|Daily + simplified dual-series chart
- [x] 2.3 Wire onto Today below Training Load / week cluster; Open web → `/dashboard`
- [x] 2.4 Confirm `workout:read` already in `COMPANION_SCOPES`

## 3. Docs and verify

- [x] 3.1 Update `docs/product-baseline.md` + `docs/open-questions.md`
- [x] 3.2 Typecheck / tests; manual compare to web Monthly Progress for same sport/metric
