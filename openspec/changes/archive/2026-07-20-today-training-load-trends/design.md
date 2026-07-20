## Context

Web `AthleteProfileCard` Training Load & Form strip shows CTL/ATL/TSB with `TrendIndicator` comparing summary current vs `pmcData.data.slice(-8, -1)`. Mobile `TrainingLoadGlance` already loads PMC (`days=90`) and shows values + form status, but no %. `calculateTrend` already exists for wellness.

## Goals / Non-Goals

**Goals:** Web-parity ±% on Today glance; signed TSB; ATL lower-is-better; sheet unchanged except optional re-auth cue.

**Non-Goals:** Moving glance into Athlete Profile; Performance Scores; changing PMC API; Chart.js.

## Decisions

1. **Trend window:** Reuse web’s prior 7 days (`series.slice(-8, -1)` excluding “today” tip if present). Prefer series from the same PMC response as summary (90d query already includes enough days).
2. **Math:** Reuse `calculateTrend` from `src/features/profile/trend.ts` (same % semantics as wellness).
3. **UI:** Compact badge next to each value (reuse Recent Wellness `TrendBadge` pattern or shared component). Omit badge when trend is null/0.
4. **Labels:** Fitness (CTL) / Fatigue (ATL) / Form (TSB); TSB display with leading `+` when > 0.
5. **403:** Quiet “Reconnect for training load” + link to Sign out / Open web — do not fabricate numbers.

## Risks / Trade-offs

- Short PMC history → no % (omit badge) — honest.
- Color semantics differ from form-status color on TSB — keep both; status line stays below.

## Migration Plan

Ship client-only. No IdP/scope change (`performance:read` already required).

## Open Questions

- None locked; 180d/YTD sheet periods remain a separate follow-up.
