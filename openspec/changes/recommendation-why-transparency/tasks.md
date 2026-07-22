## 1. Mapping

- [ ] 1.1 Extend detail view-model / types so `recovery_analysis` fields are available to the sheet (not only the unused recovery strip path)
- [ ] 1.2 Add pure `mapRecommendationDrivers` (or equivalent) that builds ordered plain-language rows from recovery_analysis + key_factors with light dedupe
- [ ] 1.3 Unit tests: factors only, recovery_analysis only, both, empty → limited-inputs, no invented metrics

## 2. Detail sheet UI

- [ ] 2.1 Replace standalone Key Factors block with **What drove this** (or agreed copy) using driver rows + honest limited-inputs empty state
- [ ] 2.2 Keep Why? / Recovery Context / Original Plan / Suggested Changes; add short helper that drivers are recommendation inputs, not live device biometrics
- [ ] 2.3 Optionally add one quiet fuel-state row when nutrition tracking + fuel state known (reuse `fuelStateLabel`; no macro tiles)
- [ ] 2.4 Ensure copy avoids medical/diagnostic framing

## 3. Verification

- [ ] 3.1 Run today/recommendation unit tests and fix regressions
- [ ] 3.2 Manually verify View Details: rest + modify samples, thin-data recommendation, tracking on/off for fuel row
