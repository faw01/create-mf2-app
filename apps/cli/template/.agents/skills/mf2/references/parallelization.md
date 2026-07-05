# Parallelization Playbook

How to split BUILD-PLAN.md into workers that do not collide. The dependency
facts here come from how this monorepo typechecks, not from preference.

## Why foundation lands first

Frontends import backend source directly: `useQuery(api.module.fn)`
typechecks against `packages/backend/convex/`. Until the schema and function
surface exist, every UI worker is guessing at types that will change under
them. So one worker, the foundation, lands first and alone:

- Schema: one `convex/<module>/tables.ts` per domain, spread into
  `schema.ts`, with indexes for every access pattern.
- The public function surface for each domain module, with args and returns
  validators, org-scoped through `getOrgContext` where the product is B2B.
- The entitlement model: which plan unlocks what, expressed as queryable
  helpers over the Stripe component's subscription state.
- convex-test coverage for the core invariants.

The foundation must also keep the generated `api` type intact: an action
that calls back into its own deployment without explicit type annotations
collapses `api` to `any` for every consumer. This is the circular-inference
rule in the convex-conventions skill; the foundation worker reads that skill
before writing a single function.

Foundation gate: `bun run typecheck --filter=@repo/backend` and the backend
test suite green. Nothing else merges before this.

## Dependency edges

- Backend schema and api block all product UI: `apps/app` and `apps/mobile`
  consume `api.*` types from source.
- Payments depend on the entitlement schema: checkout, portal, and webhook
  sync already ship, but plan gating needs the foundation's entitlement
  helpers.
- Web marketing, email templates, docs, and storybook stories are fully
  independent: none of them import backend source.
- Mobile depends on the backend api but not on the web app's UI:
  `apps/mobile` imports backend types and `design-system-native`, never
  `apps/app` code.
- Desktop depends only on the design system; its renderer already ships a
  Convex provider, so backend consumption is optional and additive.

## Example split: a typical SaaS

For "a B2B project tracker with AI summaries, Stripe subscriptions, and a
mobile companion", six workers:

| Worker | Scope | Depends on | Gate |
| --- | --- | --- | --- |
| foundation | Convex modules (projects, tasks, entitlements): tables, validators, org scoping, entitlement helpers, convex-test coverage | nothing | backend typecheck + tests |
| payments | Pricing config, billing settings UI in `apps/app`, plan gating via entitlement helpers, checkout and portal wiring | foundation | `bun run check` + app typecheck |
| app-ui | Authenticated product surfaces in `apps/app`: project list, task board, AI summary panel wired through `createChatAgent` | foundation | `bun run check` + app typecheck |
| marketing | `apps/web` home, pricing, and blog copy; SEO metadata; i18n dictionary entries; contact flow | nothing | web typecheck |
| comms | Email templates in `packages/email`, Convex send mutations, Knock feed triggers | foundation (event signatures) | email build + backend typecheck |
| mobile | `apps/mobile` screens for the core flows against the same api | foundation | mobile typecheck |

Add a seventh worker (docs pages, storybook stories for new shared
components) when the plan includes them; it depends on nothing and can start
from the plan alone.

Scale the split to the product: a B2C app without payments might need four
workers; do not invent workers to fill a quota.

## Sizing and ownership rules

- One worker per dependency cluster, not per file. A worker should be able
  to finish without waiting mid-task on another worker.
- Every file has exactly one owner. If two workers would edit the same file,
  merge them or move the file into one worker's scope. `schema.ts` and
  root-level config belong to the foundation, always.
- Keep the foundation small: schema, types, seams, entitlements. It is the
  bottleneck; UI creep in the foundation delays everyone.

## Merging

- Foundation merges first, alone, gates green.
- Domain workers merge as they finish. Order among them does not matter
  because they own disjoint files.
- One integration pass at the end, run by the orchestrator, not the workers:
  `bun run check`, `bun run typecheck`, `bun run test`, and `bun run dev`
  boots with zero keys. Fix drift centrally in this pass rather than
  bouncing fixes back through workers.
