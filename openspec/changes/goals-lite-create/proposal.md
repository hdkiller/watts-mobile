## Why

Athletes can browse Goals from More but still must jump to web to add another goal after activation. Companion use (race season, mid-block targets) needs a field-native **create** path that reuses the existing Bearer `POST /api/goals` API already used in activation.

## What Changes

- Add a native **Create goal** flow from the Goals list (and empty state), covering the four Coach Watts goal types with minimum fields for a valid create.
- On success, invalidate goals queries and navigate to the new goal’s detail (or refresh the list).
- Keep **edit / delete / AI Suggest / Review** on Open web for this change (activation create remains as today).
- Update product baseline / open-questions so post-activation goal create is in-app, not web-only.

## Capabilities

### New Capabilities

- `goals-lite-create`: Native create-goal sheet/screen from Goals hub; Bearer `POST /api/goals` with `goal:write`; type-specific minimum fields; success → detail or list refresh.

### Modified Capabilities

- `goals-hub`: Goals list / empty state MUST expose Create (not only Manage on web).
- `goal-lite`: Ongoing path includes native create from Goals hub; deep tools (edit portfolio, AI review) remain Open web.

## Impact

- **Mobile:** create UI on Goals hub; reuse/extend `createGoal` + `CreateGoalInput`; TanStack Query invalidation; optional reuse of activation field helpers if already extracted.
- **coach-wattz:** none required — `POST /api/goals` already uses `requireAuth` + `goal:write`.
- **Product/docs:** baseline moves “create goal” into mobile lite; edit/delete/AI stay web until a later change.
