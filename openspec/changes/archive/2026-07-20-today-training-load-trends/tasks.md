## 1. Trend mapping

- [x] 1.1 Add helper to compute CTL/ATL/TSB trends from PMC summary + series (`slice(-8, -1)`), reusing `calculateTrend`
- [x] 1.2 Unit tests: web-style cases (e.g. CTL −8%, ATL −29%, TSB +29%); omit when history empty

## 2. Glance UI

- [x] 2.1 Show Fitness (CTL) / Fatigue (ATL) / Form (TSB) labels; signed TSB; trend badges (ATL lower-is-better)
- [x] 2.2 Keep tap → existing Training Load sheet; no chart on Today tab
- [x] 2.3 Optional: quiet 403 / unavailable cue with re-auth or Open web

## 3. Docs and verify

- [x] 3.1 Record decision in `docs/open-questions.md`
- [x] 3.2 Typecheck / unit tests; manual compare glance % to web dashboard for same athlete
