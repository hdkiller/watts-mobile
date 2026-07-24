## Context

Web PlanDashboard allows week stat popovers, DnD reschedule, and PlanTimelineEditor block CRUD. Mobile needs the same capabilities with sheets, pickers, and lists — not a port of drag-and-drop boards.

## Goals / Non-Goals

**Goals:**

- Edit week targets (focus/volume/TSS/recovery).
- Move a planned workout to another date (and handle conflicts per API).
- Manage blocks (add/reorder/rename/retype/duration) enough to fix a season without web.
- Keep edits confirmable and reversible via server truth (no local-only plan model).

**Non-Goals:**

- Desktop DnD calendar / PlanArchitectBoard.
- Independent workout link/unlink management (unless trivial API already used elsewhere — default out).
- Templates/share/publish.
- Adapt/replan (prior change).

## Decisions

### 1. Sheets over boards

Week tune = form sheet. Move = date picker + conflict message. Blocks = list editor with reorder controls (up/down or drag-list if already used in app).

### 2. No fake offline structure edits

Edits require network; show offline honesty.

### 3. Structure generate stays in generator

This change does not re-own sparkle generate-structure; it owns placement and targets.

## Risks / Trade-offs

- [Risk] Move conflicts with existing sessions → Mitigation: surface server error; offer alternate date.
- [Risk] Block edit breaks week generation assumptions → Mitigation: follow web validation; warn when editing active phase.
- [Risk] Scope explodes into full architect → Mitigation: checklist limited to tune/move/block CRUD APIs only.

## Migration Plan

Incremental UI on Plan Training. Rollback by hiding edit entry points.

## Open Questions

- Whether multi-workout day swaps need an explicit swap API vs move-only.
- Minimum block fields required by create/PATCH.
