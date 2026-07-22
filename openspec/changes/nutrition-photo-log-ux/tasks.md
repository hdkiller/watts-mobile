## 1. Sheet mode model

- [x] 1.1 Introduce explicit `LogMealSheet` UI modes (`compose` | `analyzing` | `review` | `logged`) and reset them whenever the sheet opens/closes
- [x] 1.2 Keep captured image URI/base64 for thumbnail across analyzing/review; clear on dismiss, retake, or successful Done

## 2. Photo analyze → review UX

- [x] 2.1 After camera returns an image, enter `analyzing` with thumbnail + analyzing copy; disable compose editing during the request
- [x] 2.2 On estimate success, enter `review` with editable name, always-visible calories/macros, meal slot, optional confidence, and photo thumbnail
- [x] 2.3 Wire primary **Save meal** from review to existing `POST /api/nutrition` path (edited values); do not auto-save on estimate success
- [x] 2.4 Add **Retake** (and/or clear estimate) from review that restarts camera or returns to compose without dismissing the sheet
- [x] 2.5 On estimate failure, show recoverable error and return to compose (or retry) without a false review state

## 3. Post-save day progress

- [x] 3.1 After successful meal save (photo review or manual compose), await nutrition query invalidation/refetch for the selected date
- [x] 3.2 Enter `logged` mode showing “Logged · {name}” (or equivalent) plus updated day progress via `NutritionTargetsCard` / totals summary
- [x] 3.3 Add **Done** dismiss (optional short auto-dismiss once totals are ready); then close sheet so Log tab reflects the save
- [x] 3.4 Keep copy factual (progress vs goals); avoid gamified celebration chrome

## 4. Compose polish / regression

- [x] 4.1 Ensure manual compose path still works and also lands on the same `logged` confirmation after save
- [x] 4.2 Demote or collapse targets/history chrome while in `analyzing`/`review` so the estimate owns the focal plane
- [x] 4.3 Confirm Coach photo attach paths elsewhere remain available and unchanged

## 5. Verification

- [ ] 5.1 Device smoke: capture → analyzing → review → edit macros → save → see day progress → Done
- [ ] 5.2 Device smoke: retake from review replaces prior estimate
- [ ] 5.3 Device smoke: estimate error recovers; manual save still shows Logged progress
- [x] 5.4 Add/adjust unit tests for any extracted mode/mapping helpers if introduced
