# BUILD-PLAN.md Template

Copy this structure into BUILD-PLAN.md at the project root and fill every
section. A section can say "none", but do not delete it: an empty non-goals
section and a missing one read very differently three weeks in.

```markdown
# Build Plan: <product name>

## Product summary

<Two or three sentences: who it is for, what it does, and the one thing it
must do well.>

Assumptions made without asking: <list, or "none">

## Features

| Feature | MF2 capability | Where code goes | Worker |
| --- | --- | --- | --- |
| Team workspaces | Clerk orgs + `getOrgContext` scoping | `convex/projects/` | foundation |
| Pro plan gating | `getUserSubscriptions` + entitlement helpers | `convex/entitlements/`, `apps/app` billing settings | payments |
| AI summaries | `createChatAgent` + chat module persistence | `packages/ai/tools/`, `apps/app` | app-ui |

## Workers

| Worker | Scope | Depends on | Gate |
| --- | --- | --- | --- |
| foundation | schema, validators, entitlement model, tests | nothing | backend typecheck + tests |
| ... | ... | ... | ... |

## Env keys

Zero keys are required for development; each key unlocks one integration
when the product needs it live.

| Integration | Key | What it unlocks | Needed when |
| --- | --- | --- | --- |
| Stripe | STRIPE_SECRET_KEY | checkout, portal, subscription sync | before first paid signup |
| AI Gateway | AI_GATEWAY_API_KEY | model calls through the gateway | before AI features go live |
| Liveblocks | LIVEBLOCKS_SECRET | presence, cursors, comments | before collab features go live |

## Non-goals

- <explicitly out of scope, one per line>

## Gates

- [ ] Foundation: backend typecheck and tests green before dependent workers start
- [ ] Per worker: `bun run check` plus scoped typecheck for touched packages
- [ ] Integration: `bun run check`
- [ ] Integration: `bun run typecheck`
- [ ] Integration: `bun run test`
- [ ] Integration: `bun run dev` boots with zero keys
```

Guidance for filling it in:

- The feature table is the contract. One row per user-visible feature, at
  capability granularity: name the function or seam, not just the package.
  If a row's capability column is empty, the feature needs new
  infrastructure and deserves a conversation before it goes in the plan.
- The example rows above are illustrations; replace them with the product's
  actual features and keep the worker names consistent with the roster.
- Env keys come from the packages the plan actually uses. Check each
  package's `keys.ts` for exact names; `bun run env:check` lists what is
  still blank.
- Non-goals prevent scope creep by workers acting in parallel. "No admin
  dashboard in v1" saves a worker from inventing one.
