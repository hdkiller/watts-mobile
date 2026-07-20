## Context

Web’s dashboard “Recent Wellness” (`AthleteProfileCard`) shows numeric tiles (Sleep, HRV, RHR, …) with `TrendIndicator` % vs trailing ~7-day average, and opens **Wellness Overview** (`WellnessModal`) for a fuller day: more metrics, AI analysis, editable logs, and **7-Day Trends** bar charts.

Mobile Today already has a 3-tile strip (Sleep / HRV / Feel) mapped from recommendation `analysisJson.recovery_context` — not from wellness biometrics — so it vanishes without a recommendation and never shows RHR. Log tab owns wellness writes (`POST /api/wellness`) with a narrower `WellnessDay` shape (no HRV/RHR). Scopes `profile:read` and `health:read` are already in `COMPANION_SCOPES`.

`today-home` forbids a second wellness **form** on Today; a read-only glance (like Coming up / Recently) is the intended pattern.

## Goals / Non-Goals

**Goals:**

1. Show a read-only **Recent Wellness** glance on Today with Sleep, HRV, and RHR when present, plus trend % vs ~7-day average (web parity for the tile row athletes quoted).
2. Honest empty state: **“No recent wellness · Check in”** when all three metrics are absent; N/A omit-per-metric when only some are missing; stale caption when latest day is not today.
3. **Inline-expandable 7-day bar trends** for Sleep / HRV / RHR (collapsed by default; tap glance to expand) without shipping the full Wellness Overview modal.
4. Decouple biometric tiles from recommendation AI so wellness context survives “no recommendation yet”; **remove** the AI Sleep/HRV/Feel strip.
5. Check in navigates to Log tab; no duplicate form. Glance loads independently of the recommendation query.

**Non-Goals:**

- Full Wellness Overview modal (AI analysis, PATCH daily logs, custom fields, metric visibility settings).
- Body Fat / SpO2 / BP / VO2 / sleep-stages stack (follow-up).
- New `/api/mobile/today` BFF.
- Replacing Log check-in or HealthKit prefill flows.

## Decisions

### 1. Data sources (compose existing APIs)

| Need | Endpoint | Scope |
|------|----------|--------|
| Latest Sleep / HRV / RHR + `latestWellnessDate` / `hasCurrentDayWellness` | `GET /api/profile/dashboard` | `profile:read` |
| 7-day series for % and bars | `GET /api/wellness/trend?startDate&endDate` | `health:read` |

**Decision:** Two parallel TanStack Query hooks on Today (or one feature-level `useRecentWellnessQuery` that fans out internally). Prefer dashboard `recent*` fields for “current” values rather than re-deriving from the trend array tip (matches web card). Do not invent a mobile BFF for this slice.

**Alternative considered:** Only `GET /api/wellness` (Log already fetches). Rejected for glance: list is not “most recent meaningful wellness” normalized the way dashboard is, and trend % needs the trend endpoint or client reimplementation of dashboard merge logic.

### 2. Coexistence with AI recovery strip

```
BEFORE                          AFTER (recommended)
─────────────────────────       ────────────────────────────────
Sleep/HRV/Feel from AI          Recent Wellness: Sleep / HRV / RHR (+ %)
(only if recommendation)        from dashboard + trend

                                Feel / readiness narrative stays in
                                recommendation hero or a single
                                “how you feel” chip if still useful —
                                not as a fake biometric
```

**Decision (locked):** Replace AI Sleep/HRV tiles with real wellness tiles. **Remove AI “Feel”** from that strip entirely (subjective / readiness-adjacent; covered by Log readiness + recommendation rationale). Do not show both strips.

### 3. Placement on Today

**Decision:** Place Recent Wellness **below** the recommendation/planned hero and **near** Active Recovery Context (either just above or just below that band), still **above** Coming up / Recently. It is context for the decision, not a dashboard header. Must not push primary Accept/Rest CTAs out of the first-viewport composition when a recommendation exists — prefer a single compact row of 3 tiles.

**Interaction (locked):** Tapping the glance (or an expand control on it) **expands/collapses 7-day bars inline**. A separate **Check in** control navigates to the Log tab wellness section — not a new modal.

### 4. Trend % math (port web)

Port `calculateTrend(current, previousValues[], type)` from `coach-wattz/app/composables/useTrend.ts`:

- `previous` = non-null values from the 7-day trend window (web uses mean of that array).
- Display `Math.round(percent)` with `+`/`-`; direction coloring: Sleep/HRV `higher-is-better`, RHR `lower-is-better`.
- Flat deadband ~1% → muted “stable” treatment without inventing a different number.
- Omit % when history is empty or current is null (show N/A for the metric, not `0%`).

### 5. Charts scope

**Decision (locked):** Tiles + trend % always; compact 7-day **bar** rows for Sleep / HRV / RHR load with the same trend series and show when the glance is **expanded inline** (collapsed by default). View/`react-native-svg` only — no Chart.js. Full Wellness Overview modal deferred.

### 6. Staleness

Use `hasCurrentDayWellness` / `latestWellnessDate` from dashboard (and/or date on trend tip). Show a quiet “Yesterday” / “N days ago” caption when not today — web’s stale labeling pattern, kept short for mobile.

### 7. Metric set for v1

**Locked:** **Sleep (hrs), HRV (ms), RHR (bpm)** only. Omit an individual tile when its value is null. No Recovery % / Readiness / Body Fat in this glance. No configurable metric visibility settings.

### 8. Empty state

**Locked:** When Sleep, HRV, and RHR are all absent, still render the glance with quiet copy **“No recent wellness · Check in”** (Check in → Log). Do not omit the section entirely.

### 9. Independence from recommendation

**Locked:** Fetch and show the wellness glance whether or not today’s recommendation has loaded — cold mornings still see biometrics.

## Risks / Trade-offs

- **[Two Sleep/HRV sources if AI strip kept]** → Replace AI biometric tiles; document in specs.
- **[Dashboard payload weight]** → Profile dashboard may include more than wellness; acceptable for v1; map only needed fields. If payload is heavy later, ask coach-wattz for a thinner wellness summary.
- **[Trend window edge cases]** → Single data point → no %; all three absent → “No recent wellness · Check in”.
- **[Log `WellnessDay` still lacks HRV/RHR]** → Glance reads dashboard/trend; Log form unchanged. Athletes with only manual sleep/readiness may see Sleep from check-in but N/A HRV/RHR until wearables sync — honest.
- **[First-viewport density]** → Keep one compact row; bars collapsed by default if included.

## Migration Plan

1. Add wellness dashboard + trend clients/mappers/tests.
2. Build `RecentWellnessGlance` (tiles + % + stale + empty copy + Check in); wire on Today; remove AI Sleep/HRV/Feel strip.
3. Inline expand/collapse 7-day bars for Sleep / HRV / RHR.
4. Update open-questions decision log.
5. Rollback: hide glance component; Today remains recommendation-first.

## Open Questions

_None — product decisions locked 2026-07-19 (inline expand bars, empty copy, Sleep/HRV/RHR only, drop AI Feel, glance independent of recommendation)._
