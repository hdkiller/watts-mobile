# Maestro flows

YAML journeys for the Coach Watts companion. **Conventions, testID inventory, and when to update flows during development** live in [docs/e2e.md](../docs/e2e.md) — start with § *Maintaining e2e during development*.

| Path | Role |
|------|------|
| `smoke-*.yaml` | Tiny CI gate (unauth login, auth tab shell) |
| `flow-*.yaml` | Companion journeys (open/assert, a few resettable mutations) |
| `subflows/` | Shared steps (expo-dev-client → Metro, Dev Menu dismiss) |

```bash
pnpm test:e2e:validate   # required files present (no simulator)
pnpm test:e2e:smoke      # unauth + shell
pnpm test:e2e            # entire suite
maestro test maestro/flow-log-checkin-open.yaml   # one file
```

Register new suite-entry flows in `scripts/validate-maestro-flows.mjs` and the Flows table in `docs/e2e.md`.
