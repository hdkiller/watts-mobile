## 1. Intensity resolution (P0)

- [x] 1.1 Confirm coach-wattz `resolveStepChartIntensity` + default zone bands; note mobile port boundaries (no cadence/strength chart paths)
- [x] 1.2 Add target-aware intensity helper (relative intensity + zone index) using step targets, `zoneProfileSnapshot`, and optional FTP/LTHR/threshold pace refs
- [x] 1.3 Fix `intensityFromStep` so percent / `%FTP` power targets are labeled as percent (not watts); keep zone-unit HR/power labels
- [x] 1.4 Wire planned detail / `StructureProfile` to target-aware intensity (keep label parse as last resort); pass athlete thresholds when already available without new fan-out
- [x] 1.5 Vitest: `%FTP`, absolute watts±FTP, HR zone units, unresolved → neutral; update existing `stepIntensity` / structure fixtures as needed

## 2. Silhouette shape fidelity (P1)

- [x] 2.1 Chart-only flatten that expands `reps`/`repeat` into timed leaf steps with documented caps
- [x] 2.2 Render ramp steps as start→end height wedges when ramp target data exists; steady steps remain rects
- [x] 2.3 Apply rest/fallback relative heights when intensity is known; keep neutral mid height only when unresolved
- [x] 2.4 Vitest / fixture coverage for repeats and ramps; manual compare one sweet-spot planned workout vs web mini chart

## 3. List glance gate (P2)

- [x] 3.1 Inspect `GET /api/planned-workouts` / Today aggregate for previewable `structuredWorkout`; record finding in `docs/open-questions.md` if missing
- [x] 3.2 If preview data exists (or a small coach-wattz preview field lands): map it on list items and render compact mini-chart on Upcoming / Coming-up rows without detail N+1
- [x] 3.3 If preview data is absent: skip UI work; leave backend follow-up noted — do not invent endpoints

## 4. Polish and verification

- [x] 4.1 Ensure strength-shaped planned detail still skips the endurance silhouette
- [x] 4.2 Update Maestro / `testID`s only if Upcoming or planned-detail structure chrome changes entry points covered by e2e
- [x] 4.3 Spot-check zone rail colors on planned detail step list still match silhouette colors for the same steps
