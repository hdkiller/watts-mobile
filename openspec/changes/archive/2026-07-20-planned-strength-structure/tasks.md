## 1. Mapping

- [x] 1.1 Add helpers to summarize strength `setRows` into compact prescription text (sets × reps/value · load · rest; `/side` when `prescriptionMode` is `reps_per_side`)
- [x] 1.2 Extend `mapPlannedStructure` to prefer `blocks`, then legacy `exercises`, then existing `steps`/`intervals` — never double-count
- [x] 1.3 Optionally emit block title rows (warmup/main/cooldown) before their exercises when titles are present
- [x] 1.4 Expose a strength-shaped flag (or equivalent) on `PlannedDetail` so the UI can skip `StructureProfile`

## 2. UI

- [x] 2.1 Render strength structure rows on planned detail using the existing Structure list (name + prescription in the meta line)
- [x] 2.2 Hide `StructureProfile` when structure is strength-shaped; keep profile behavior for endurance steps
- [x] 2.3 Keep the honest empty / Open web fallback when neither endurance nor strength structure is present

## 3. Tests

- [x] 3.1 Unit-test `mapPlannedStructure` with `blocks` + `setRows` fixtures (including divergent loads)
- [x] 3.2 Unit-test legacy `exercises` fallback and that `blocks` wins when both exist
- [x] 3.3 Confirm endurance `steps`/`intervals` fixtures still map as before
