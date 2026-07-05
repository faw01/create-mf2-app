---
name: mf2
description: Turn a product idea into a structured build plan and parallel execution strategy for this MF2 scaffold. Use when the user describes a product, app, or startup idea to build on this scaffold, asks where to start, how to plan or parallelize a build, or what the scaffold already provides, even if they do not mention mf2 by name. Probes once for the requirements that change the plan (B2B vs B2C, monetization, realtime collaboration, AI features, target surfaces, content and marketing, notifications), maps every feature to the specific capability the template already ships so nothing gets rebuilt, writes BUILD-PLAN.md at the project root, and splits the work into parallel workers with dependency edges and quality gates.
---

# mf2

This skill turns a product idea into a build plan that exploits everything this
scaffold ships, then into parallel execution. Work the five phases in order;
Probe and Map usually fit in one turn.

The scaffold is a bun + Turborepo monorepo: eight apps (`app`, `web`, `api`,
`mobile`, `desktop`, `docs`, `email`, `storybook`) over 22 shared packages,
with the backend in `packages/backend/convex/` and Clerk auth wired
everywhere. Everything boots with zero keys: a blank env value disables that
integration, guarded call sites log one skip line, and nothing crashes. Repo
conventions live in `.agents/AGENTS.md` and the vendored skills in
`.agents/skills/`.

## Phase 1: Probe

Skip any question the idea already answers. If the remaining unknowns would
not change the plan, skip the round entirely and record your assumptions in
BUILD-PLAN.md instead.

Otherwise ask ONE batched round covering only the questions that change the
mapping:

- B2B or B2C: do users work in orgs and teams with roles, or as personal
  accounts? This decides org scoping in the schema and whether Clerk
  organizations, invitations, and enterprise SSO are in play.
- Monetization: subscriptions, one-time purchases, or free? What gets gated
  (features, seats, usage)?
- Realtime collaboration: do multiple users see each other live (presence,
  cursors, comments)?
- AI features: chat, generation, agents with tools, or none?
- Surfaces: web app only, or also mobile (Expo) or desktop (Electron)?
- Content and marketing: blog or CMS, SEO pages, multiple languages, a docs
  site?
- Notifications and email: in-app feeds, mobile push, transactional email
  flows?

Do not drip questions across turns. Do not ask things discoverable from the
idea itself: "an internal tool for our sales team" already answers B2B.

## Phase 2: Map

Read references/capabilities.md when mapping features onto the scaffold. Map
each requirement to the specific capability, not a package name: "billing
portal" maps to `createCustomerPortal` in `convex/stripe/index.ts`, not to
"the payments package".

MF2 already provides all of the following. Plans build on these and never
rebuild them:

- Auth UI and session wiring: prebuilt sign-in and sign-up pages, providers
  for web and native, middleware. Clerk owns orgs, roles, invitations, and
  enterprise SSO.
- User sync: the Clerk webhook in `convex/http.ts` maintains the `users`
  table.
- Payment machinery: checkout, customer portal, subscription sync, and
  webhook verification via `@convex-dev/stripe`.
- Entitlement seams: subscriptions are queryable per user or org; gating is
  a query, not a new system.
- Design system: 56 web components (`@repo/design-system`) and 32 native
  counterparts. Never install another UI kit or hand-roll primitives.
- Env validation: packages validate keys in `keys.ts`, apps in `env.ts`,
  Convex in `convex.env.ts`. New keys extend these files.
- Webhook verification: Clerk, Stripe, and Resend inbound webhooks are
  verified and routed.
- Security plumbing: Arcjet `secure()`, nosecone headers, the Upstash rate
  limiter factory.
- Observability: Sentry wiring, `log` from `@repo/observability/log`,
  `parseError`.
- i18n locale routing, SEO metadata and JSON-LD helpers, file upload with
  ownership checks.

State in the plan which of these the product uses, so workers know they
exist before writing a line.

## Phase 3: Plan

Read references/plan-template.md when writing BUILD-PLAN.md. Write the plan
at the project root.

The plan contains, in order: product summary, feature table (feature, MF2
capability, where code goes, worker), worker roster with dependencies, env
keys table, non-goals, gates checklist.

Rules that keep plans honest:

- New code follows repo conventions: backend modules as `convex/<module>/`
  folders with a `tables.ts` spread into `schema.ts`; product UI in
  `apps/app` route groups with colocated `components/` folders; marketing in
  `apps/web/app/[locale]/`.
- Zero-keys first: everything must build and run with blank env. The env
  keys table records which key unlocks each integration later; no feature
  may hard-require a key to boot.
- Non-goals are explicit. Anything the user did not ask for and the scaffold
  does not force stays out.

## Phase 4: Parallelize

Read references/parallelization.md when splitting the plan into workers.

The one rule that cannot bend: a single foundation worker lands the Convex
schema, shared types, and entitlement model before anything else merges.
Consumers typecheck against backend source, so the foundation must land
first and keep the generated `api` type intact (the circular-inference rule
in the convex-conventions skill). After the foundation, domain workers run
in parallel along the dependency edges in the playbook, each with its own
quality gates.

## Phase 5: Execute

Brief each worker with all of the following. Workers do not inherit your
context; the briefing is everything they know.

1. Scope: their section of BUILD-PLAN.md, the files they own, and the
   dependency edges they must respect.
2. The vendored skills for their domain, by name under `.agents/skills/`:

| Domain | Skills |
| --- | --- |
| Backend (Convex) | `convex-conventions` (this repo's rules, read first), `convex` |
| Auth | `clerk`, `clerk-orgs` (B2B), `clerk-webhooks`, `clerk-nextjs-patterns`, `clerk-expo-patterns` (mobile) |
| Payments | `stripe-best-practices` |
| Collaboration | `liveblocks-best-practices` |
| Email | `react-email`, `resend` |
| Analytics and flags | `posthog-instrumentation` |
| Web UI | `shadcn`, `web-design-guidelines`, `vercel-react-best-practices`, `vercel-composition-patterns` |
| Mobile | `building-native-ui`, `expo-tailwind-setup`, `vercel-react-native-skills`, `native-data-fetching` |
| Security | `arcjet`, `upstash-redis-js` |
| Docs | `mintlify` |
| Monorepo | `turborepo` |

3. Conventions: read `.agents/AGENTS.md`; bun for everything; `type` not
   `interface`; every Convex function declares args and returns validators.
4. The zero-keys degradation pattern: a blank env value means the
   integration is disabled; guard the call site and log one skip line, for
   example `log.warn("Skipping X: set KEY_NAME to enable")`. Follow the
   shipped examples in `packages/notifications/index.ts` and
   `packages/webhooks/lib/svix.ts`.
5. Commits: conventional commits, single line, `type(scope): description`.
6. Per-worker gates before handing back: `bun run check` plus a scoped
   typecheck and test pass for the packages they touched.

After all workers merge, run one integration pass: `bun run check`,
`bun run typecheck`, `bun run test`, and confirm `bun run dev` boots. Fix
integration failures before reporting done.
