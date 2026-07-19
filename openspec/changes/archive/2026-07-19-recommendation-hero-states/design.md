# Design — Recommendation Hero States

## Context

`today.tsx` renders the hero with a fixed `text-brand` action label inside a zinc card; confidence is a sentence; accepted state is a green text line while the Accept button remains visible logic-gated by `canAccept`. `mapTodayPayload` already exposes `action` (e.g. `train`/`rest`/`modify` strings from the API), `confidence` (0–1 or 0–100), and `userAccepted`.

## Goals / Non-Goals

**Goals:**
- Glanceable action category via color before reading text.
- Confidence as a quiet visual; accepted as a terminal state of the CTA area.

**Non-Goals:**
- No modify/rest action buttons (issue 004 is a separate change).
- No change to accept mutation, refetch behavior, or payload mapping contracts.
- Rest-day visuals stay within the existing dark card language — no illustrations.

## Decisions

1. **Encode with accent, not full recolor.** Keep the zinc card; vary a left accent border, the kicker/action label color, and a faint background tint (`bg-<tone>/10`). Full card recolors were rejected — they'd fight the dark system and overwhelm the first viewport. Mapping: train → brand green; rest → `sky`/violet tone (added token `recovery`); modify → amber; unknown action falls back to brand.
2. **Category from `action` with safe fallback.** A `heroToneForAction(action)` helper (pure, unit-tested, in `mapTodayPayload.ts`) normalizes API action strings to `train | rest | modify`. Unrecognized values → `train` tone so new backend actions never break the hero.
3. **Confidence dots.** Three dots: filled count = low (<0.45), medium (<0.75), high (≥0.75) after normalizing the existing ≤1 vs percent ambiguity in one place. Dots sit inline right of the kicker. Rejected a bar (reads as progress) and hiding entirely (signal is useful when low).
4. **Accepted replaces the CTA.** When `userAccepted`, render a confirmed row (checkmark glyph + "Accepted — view workout" acting as the link to the planned detail) instead of the Accept button; "View workout details" secondary button collapses into it. Keeps one obvious next action and makes accept feel terminal.

## Risks / Trade-offs

- [API action vocabulary wider than train/rest/modify] → fallback tone + unit test enumerating known values; log unknowns to Sentry breadcrumb.
- [New tones drift from brand palette] → add tokens once in `colors.ts`/tailwind and document in DESIGN.md; no inline hex in the screen.

## Open Questions

- Exact rest tone (sky vs violet) — pick against the dark background during implementation; document the winner in DESIGN.md.
