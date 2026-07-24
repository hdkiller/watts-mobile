## Context

Web PlanDashboard exposes Adapt (RECALCULATE_WEEK / PUSH_FORWARD) and Abandon, plus server-side replan-structure. Mobile Plan tab will own these for field recovery. Generator already creates/activates; this change is the disruption toolkit.

## Goals / Non-Goals

**Goals:**

- Two adapt actions with clear copy and confirm.
- Abandon with destructive confirm; Start new → generator.
- Replan structure when supported, with progress UX.
- Invalidate Plan/Today/Upcoming queries after success.

**Non-Goals:**

- Free-text “Plan with AI” full week editor beyond what generator already offers.
- Block DnD architect (`plan-structure-edit`).
- Templates/share/publish.

## Decisions

### 1. Action sheet from Plan Training header

Primary overflow / “Adjust plan” entry lists Adapt options, Replan, Abandon, Start new — keeps Today clean.

### 2. Confirm every destructive or schedule-shifting action

Push forward, recalculate, replan, abandon require explicit confirm with consequence copy.

### 3. Start new = abandon (or equivalent) then generator

Do not leave two ACTIVE plans; follow server activate/abandon semantics.

### 4. Replan structure optional if API immature

If Bearer replan-structure is not ready, ship adapt + abandon first and gate replan behind API readiness task — do not fake client-side replan.

## Risks / Trade-offs

- [Risk] Adapt jobs long-running → Mitigation: reuse generator job poller patterns.
- [Risk] Athlete abandons by mistake → Mitigation: typed or two-step confirm; no swipe-to-abandon.
- [Risk] Today still shows old planned hero after adapt → Mitigation: invalidate recommendation/planned/upcoming queries.

## Migration Plan

Ship behind normal release after generator. No schema migration.

## Open Questions

- Exact adapt enum names and whether both actions always available mid-week.
- Whether replan-structure archives workouts or regenerates in place (follow server).
