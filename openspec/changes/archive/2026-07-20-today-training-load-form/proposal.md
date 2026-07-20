## Why

Web’s dashboard exposes **Training Load & Form** (CTL / ATL / TSB) as a glance that opens a modal with period-selectable PMC context — athletes use it to judge whether today’s work fits fitness and form. Mobile Today has no load/form signal at all (only a planned-vs-done week strip), so field decisions lack the same stress-balance cue. A companion glance + sheet brings that explanation to the Today tab without putting a CTL grid in the first viewport or shipping the full Performance analytics explorer.

## What Changes

- Add a compact **Training Load & Form** glance on Today: current **Fitness (CTL)**, **Fatigue (ATL)**, and **Form (TSB)** with form status label/color from the API summary — not a multi-series chart on the tab itself.
- Tapping the glance (or a score tile) opens a **Training Load & Form** sheet: short CTL/ATL/TSB explanation, summary cards, period selector (e.g. 30/60/90 days), and a simplified PMC line chart for the selected window.
- Source data from existing Bearer API `GET /api/performance/pmc?days=` (and optionally recovery-context overlay only if it stays cheap and useful; otherwise skip overlay for v1 of this change).
- Provide **Open web** escape to instance `/performance` for full analytics — not an in-app performance explorer.
- Respect Today’s first-viewport rule: glance sits **below** primary decision CTAs as a thin context strip; the chart lives only in the sheet.
- Out of scope: full Performance analytics screens, TSS explainer encyclopedia, editing training stress, new mobile BFF, Garmin attribution chrome, calendar heatmaps.

## Capabilities

### New Capabilities

- `training-load-form`: Today glance for CTL/ATL/TSB + Form status, and a read-only Training Load & Form sheet with period-selectable PMC chart and Open web escape.

### Modified Capabilities

- `today-home`: Today composition SHALL include a Training Load & Form glance below the decision surface (alongside other context glances), without introducing a CTL grid or heatmap in the first viewport.

## Impact

- UI: new glance + sheet under `src/features/today/` or `src/features/performance/`; wire into `app/(app)/(tabs)/today.tsx`.
- Data: new fetcher/hook for `GET /api/performance/pmc` (confirm OAuth scope — typically performance/analytics read already used by web dashboard; document required scope and add to `COMPANION_SCOPES` if missing).
- Charts: prefer existing mobile chart approach (`react-native-svg` / lightweight path) — avoid pulling Chart.js; keep series count to CTL/ATL/TSB.
- coach-wattz: reuse `pmc.get` + form status helpers; no new endpoint required if Bearer access matches web.
- Product: advances the “weekly glance (load/form lite)” item from later/v1.5 in `docs/product-baseline.md` into a concrete companion slice; still excludes full CTL dashboard sprawl on the first viewport.
