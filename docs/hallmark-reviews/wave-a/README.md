# Hallmark reviews · Wave A

Read-only audits against [`docs/DESIGN.md`](../../DESIGN.md). Date: 2026-07-24. Genre: modern-minimal (app companion). No TSX edits.

| # | Surface | File | Pri | C | M | m | Top critical / major |
|---|---------|------|-----|---|---|---|----------------------|
| 00 | Boot redirect | [`00-boot-index.md`](./00-boot-index.md) | P3 | 0 | 2 | 0 | Blank/`null` + AuthenticatedEntry spinner |
| 01 | Login | [`01-login.md`](./01-login.md) | P0 | 0 | 1 | 3 | Missing system reference (no stamp) |
| 02 | Instance URL | [`02-instance.md`](./02-instance.md) | P1 | 0 | 2 | 2 | Hand-rolled Continue vs shared `Button` |
| 03 | Activation index | [`03-activation-index.md`](./03-activation-index.md) | P0 | 0 | 2 | 0 | Full-screen spinner instead of skeleton |
| 04 | Consent | [`04-consent.md`](./04-consent.md) | P0 | 0 | 1 | 2 | Missing system reference |
| 05 | Goal lite | [`05-activation-goal.md`](./05-activation-goal.md) | P0 | 0 | 2 | 2 | First-viewport decision overload (types + fields) |
| 06 | Plan lite | [`06-activation-plan.md`](./06-activation-plan.md) | P0 | 0 | 3 | 2 | Decision overload + working-phase spinner |
| 07 | First insight | [`07-activation-insight.md`](./07-activation-insight.md) | P0 | 0 | 2 | 2 | Spinner instead of list skeleton |
| 08 | Connect last | [`08-activation-connect.md`](./08-activation-connect.md) | P0 | 0 | 1 | 2 | Missing system reference (otherwise cleanest) |
| 09 | Subscription | [`09-subscription.md`](./09-subscription.md) | P1 | 1 | 4 | 3 | `border-warning` non-semantic token |

**Wave totals:** 1 critical · 20 major · 18 minor

**Patterns across Wave A**

1. Every surface lacks `/* Hallmark · … design-system: docs/DESIGN.md */`.
2. Activation boot/index/plan-working/insight loads lean on `ActivityIndicator` vs skeletons; root `app/index` blanks then spins in `AuthenticatedEntry`.
3. Subscription is the only critical: invented `border-warning` + hand-rolled store CTAs + “Watt Mind” copy.
4. Login / Consent / Connect are the most system-aligned compositions once stamped.
