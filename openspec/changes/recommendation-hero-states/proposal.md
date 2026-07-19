# Recommendation Hero States

## Why

The Today recommendation hero (docs/issues/003.md) renders every decision identically in brand green, shows confidence as debug-like text ("Confidence 85%"), and barely changes after accepting. The athlete should know the day's shape — train, rest, or modified — before reading a word, and accepting should feel like completing the morning loop.

## What Changes

- Hero card tint and accent encode the recommended action: energetic brand green for train, a calm blue/violet treatment for rest, amber for modify.
- Confidence renders as a quiet visual (three-dot strength indicator) instead of a percentage sentence; hidden when confidence is absent.
- After a successful accept, the CTA block swaps to a confirmed state: checkmark + "Accepted — view workout" (or "Rest day accepted"), replacing the Accept button rather than adding a text line.
- No API or payload changes; uses fields already mapped by `mapTodayPayload` (`action`, `confidence`, `userAccepted`).

No coach-wattz backend dependency.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `today-home`: decision-surface requirement — the hero SHALL visually encode the action category and represent confidence non-textually.
- `recommendation-actions`: accept requirement — the accepted state SHALL replace the primary CTA with a confirmed affordance linking to the workout.

## Impact

- `app/(app)/(tabs)/today.tsx` — hero card styling by action, confidence dots, accepted-state CTA block.
- `src/theme/colors.ts` / `tailwind.config.js` — rest (blue/violet) and modify (amber) accent tokens, documented in `docs/DESIGN.md`.
- `src/features/today/mapTodayPayload.ts` — normalize action → state category if needed (tests updated).
