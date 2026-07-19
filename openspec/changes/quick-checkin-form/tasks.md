# Tasks — Quick Check-in Form

## 1. Tap controls

- [ ] 1.1 Build a reusable `ChipRow` (or inline) component styled like recovery-event time presets; selected = `border-brand bg-brand/10`, tap-again clears
- [ ] 1.2 Replace readiness Field with a 1–10 chip row writing string values into `LogFormValues`
- [ ] 1.3 Replace sleep-quality Field with a 1–5 chip row
- [ ] 1.4 Add ±0.5h steppers beside the sleep-hours input

## 2. Save affordance and weight unit

- [ ] 2.1 Track "was prefilled" from `formFromWellness`; label save control "Update check-in" vs "Save check-in"
- [ ] 2.2 On successful save, morph the button to a checkmark + "Saved" state for ~2s; remove the below-fold text line
- [ ] 2.3 Expose `weightUnit` from `mapProfile` (fallback `kg`) and use it in the weight field label/placeholder

## 3. Verification

- [ ] 3.1 Existing `mapLogForm` tests still pass unchanged; add tests for any new mapping helpers
- [ ] 3.2 `npx tsc --noEmit` and `npm test` pass
- [ ] 3.3 Manual pass: full check-in (readiness + sleep + quality) completed without the keyboard appearing
