# MF2 Capability Catalog

Every entry is verified against the template source. Use it to map product
requirements onto specific capabilities. Where a vendored skill covers depth
(API details, gotchas), the entry points to it instead of duplicating.

Each entry answers three things: what ships, when a product needs it, and
where the seam for new code lives.

## Backend and data

### packages/backend (Convex)

The foundation. Schema at `convex/schema.ts` composed from per-module
`tables.ts` files; a new domain is a new `convex/<module>/` folder with its
tables spread into the schema. Read the `convex-conventions` skill before
touching it.

- Auth seams in `convex/auth/users.ts`: `mustGetCurrentUser`,
  `getCurrentUser`, and `getOrgContext` (org id from the Clerk JWT `org_id`
  claim). Org-scoped data starts here.
- The `users` table is synced from Clerk by the `/webhooks/clerk` HTTP
  action. Never write a second sync.
- Chat module (`convex/chat/`): threads and messages tables with full-text
  search indexes and typed message-part validators (text, reasoning,
  tool-call, tool-result). This is the persistence layer for AI chat; the
  part shapes already match tool-loop output.
- File storage (`convex/files/storage.ts`): upload URL generation, save,
  fetch, and delete, all with ownership checks.
- Installed components (`convex.config.ts`): action-retrier, migrations,
  expo-push-notifications, resend, stripe, workflow. Durable workflows and
  automatic retries need no new infrastructure.
- Crons (`convex/crons.ts`): the hourly Resend cleanup shows the pattern for
  scheduled work.
- HTTP router (`convex/http.ts`): verified Clerk and Resend webhooks that
  answer 503 with a skip log when unconfigured, plus Stripe component routes
  at `/stripe/webhook`.
- Migrations (`convex/migrations.ts`): `@convex-dev/migrations` runner for
  live-data changes.
- Env (`convex.env.ts`): every key optional; blank disables the integration.
- Tests: `convex-test` runs in memory with no deployment;
  `t.withIdentity({ subject, org_id })` simulates users and orgs.

Needed when: any persistent data, server logic, scheduled jobs, or inbound
webhooks. Always the foundation worker's territory.

### packages/convex

React providers that bind Clerk auth into Convex for web and native, plus an
HTTP client for server-side calls. Needed when a new surface talks to the
backend: wrap it in the provider and `useQuery(api.*)` works.

## Identity

### packages/auth (Clerk)

Prebuilt sign-in and sign-up components (web and native variants),
ClerkProvider setup for both platforms, middleware, native OAuth hooks with
browser warm-up, and server exports (`auth`, `clerkClient`, `currentUser`,
webhook payload types). Clerk itself supplies organizations, roles and
permissions, invitations, enterprise SSO, and user metadata that can carry
billing-adjacent state; the `clerk-orgs` skill covers that surface.

Needed when: always. Never rebuild auth UI or session handling.

## Payments

### packages/payments + convex/stripe

Two layers. `packages/payments` exposes the raw Stripe SDK (undefined
without `STRIPE_SECRET_KEY`) and a Stripe agent toolkit so AI agents can
drive payment operations. The machinery lives in `convex/stripe/index.ts` on
`@convex-dev/stripe`: subscription checkout, one-time payment checkout,
customer portal, cancellation, and `getUserSubscriptions` /
`getUserPayments` queries. The component syncs subscription and payment
state into its own tables via `/stripe/webhook`, keyed by userId and
optionally orgId.

Entitlement seam: gate features by querying subscription status and priceId
through the component (start from `getUserSubscriptions`); define the
plan-to-feature mapping once in the foundation, not scattered through UI.
`apps/api/app/webhooks/payments/route.ts` shows signature-verified Stripe
events driving analytics. Depth: `stripe-best-practices` skill.

Needed when: subscriptions, one-time purchases, billing portal, usage
gating.

## AI

### packages/ai

Vercel AI SDK over the AI Gateway: `gateway(model)` with per-provider
routing presets and zero-data-retention defaults, a model catalog (Claude,
GPT, and Gemini families) in `models/index.ts`, and per-provider reasoning
options. `createChatAgent` builds a `ToolLoopAgent` with typed per-tool
context: a tool that declares `contextSchema` makes `toolsContext` a
compile-time requirement (worked example in `tools/hello.ts`). A Perplexity
web-search tool activates with `PERPLEXITY_API_KEY`. System and title
prompts plus token cost utilities ship alongside. Depth: `ai-sdk` skill.

Needed when: chat, generation, or agents with tools. Seam: new tools in
`packages/ai/tools/`, new agents in `packages/ai/agent/`, persistence via
the backend chat module.

From Convex functions, do not import `@repo/ai`'s gateway: it reads env
through a Next-only mechanism. Call `createGateway` from `@ai-sdk/gateway`
directly against `convex.env`'s `AI_GATEWAY_API_KEY`; `ai` is available in
the backend for `generateText`.

## Realtime collaboration

### packages/collaboration (Liveblocks)

Server `authenticate()` grants org-scoped room access (write to
`${orgId}:*`), so multi-tenant room security is one convention rather than
custom ACLs. Global Liveblocks types in `config.ts` (Presence, Storage,
UserMeta, ThreadMetadata) type every hook. The `Room` wrapper takes
`resolveUsers` and `resolveMentionSuggestions`, the hooks for comments and
mentions. Working cursors and an avatar stack ship in `apps/app` behind
`LIVEBLOCKS_SECRET`, with the auth endpoint at
`apps/app/app/api/collaboration/auth`. Depth: `liveblocks-best-practices`
skill.

Needed when: presence, live cursors, comments and threads, multiplayer
editing. Seam: extend the `Liveblocks` interface in `config.ts`, then create
rooms per document or board.

## Notifications and email

### packages/notifications (Knock) + convex/notifications.ts (Expo push)

Knock server client (undefined without `KNOCK_SECRET_API_KEY`) for
triggering cross-channel workflows, plus in-app feed UI: the
`NotificationsTrigger` popover renders nothing when unconfigured. Mobile
push is separate: `convex/notifications.ts` records Expo push tokens and
sends per-user notifications through the Convex component.

Needed when: in-app notification feeds, cross-channel messaging, mobile
push.

### packages/email (React Email + Resend) + convex/email

Typed email templates in `packages/email/templates/` (a contact template
ships), a Resend client for the Next.js side, and Convex-side transactional
sends through `@convex-dev/resend` with a delivery-event webhook and cleanup
cron. `apps/email` previews templates live. Depth: `react-email` and
`resend` skills.

Needed when: welcome flows, receipts, digests, any transactional email.
Seam: new template in `packages/email/templates/`, send from a Convex
internal mutation.

## Growth

### packages/analytics (PostHog)

Client (`posthog-js`), server (`posthog-node` configured to flush
immediately for serverless), and native (Expo) clients with providers;
Google Analytics via next-config keys. The server client is undefined when
unconfigured. Depth: `posthog-instrumentation` skill.

Needed when: product analytics, funnels, session replay.

### packages/feature-flags

`createFlag(key, default)` on Vercel Flags with per-user PostHog evaluation
and safe defaults when signed out or unconfigured; Vercel Toolbar discovery
endpoints ship in both Next.js apps. Needed when: gradual rollouts,
experiments, kill switches.

### packages/seo

`createMetadata` merges page metadata with defaults (OpenGraph, Twitter
cards, Apple web app); `JsonLd` renders schema-dts structured data with HTML
escaping. Needed when: any public page. Seam: call `createMetadata` from
each route's metadata export.

### packages/internationalization

Six locales (en, es, de, fr, pt, zh) as Languine-managed dictionaries,
`getDictionary` with English fallback, and the locale-routing middleware
behind the `apps/web` `[locale]` tree. Needed when: localized marketing.
The product app is not locale-routed by default.

### packages/cms (BaseHub, optional)

Typed blog and legal-page queries that return empty results with one log
line when `BASEHUB_TOKEN` is blank, plus rich body renderer components
(TOC, code blocks, images, draft-mode toolbar). The blog and legal routes in
`apps/web` already consume it. Needed when: marketing content managed
outside git.

## Protection

### packages/security (Arcjet + Nosecone)

`secure(allowedBots)` applies shield and bot detection, throws a typed
`SecurityError`, and no-ops silently without `ARCJET_KEY`; nosecone
secure-headers middleware ships with a Vercel-toolbar-compatible variant.
Depth: `arcjet` skill. Needed when: protecting public forms, APIs, and AI
endpoints.

### packages/rate-limit (Upstash)

`createRateLimiter` factory (sliding window, `mf2` prefix) that throws a
clear error when unconfigured, so callers check the env first. The contact
form action in `apps/web` is the shipped example. Needed when: abuse-prone
endpoints, per-user quotas.

## Files

### packages/storage (Vercel Blob)

`@vercel/blob` re-export plus client-upload helpers behind
`BLOB_READ_WRITE_TOKEN`. For user files tied to backend records, prefer the
Convex files module, which has ownership checks built in. Needed when:
public assets, large media.

## Outbound webhooks

### packages/webhooks (Svix)

`send(eventType, payload, { orgId })` publishes org-scoped events to
customer endpoints and logs one skip line when `SVIX_TOKEN` is blank;
`getAppPortal()` returns an embeddable per-org portal where customers manage
their own endpoints, and `apps/app` ships a webhooks settings page around
it. Needed when: "notify my customers' systems" is a product feature.

## Observability

### packages/observability

Sentry wiring for client, server, and edge (instrumentation files plus a
next-config helper), `log` (BetterStack Logtail in production, console in
dev), `parseError` for consistent error strings, and BetterStack-backed
status components. Needed when: always. Use `log` instead of `console` in
server code.

## UI

### packages/design-system and packages/design-system-native

56 shadcn/ui components with a theme provider and dark mode, toasts
(sonner), charts, and sidebar layout primitives; the native package mirrors
32 of them on NativeWind for Expo. `apps/storybook` renders the web set.
Depth: `shadcn` skill and the component source itself.

Needed when: all UI work. Never install another UI kit.

### packages/next-config and packages/typescript-config

Shared Next.js config (bundle analyzer, image handling, env) and tsconfig
bases. New apps consume these rather than hand-rolling config.

## Surfaces (apps)

- `apps/app`: the authenticated product. Clerk sign-in and sign-up routes,
  sidebar and header shell, Convex provider, full-text search page backed by
  the backend search indexes, collaboration demo (cursors, avatar stack),
  notifications feed, webhooks portal page. Product features land here in
  route groups with colocated `components/` folders.
- `apps/web`: locale-routed marketing site: home, pricing, blog and legal
  (CMS-backed), contact form (server action with rate limiting and Resend),
  sitemap, OG metadata.
- `apps/api`: webhooks, cron jobs, and inbound integrations: health check, a
  Stripe webhook driving analytics events, a Clerk webhook driving analytics
  identify and capture. It ships lean: building public endpoints here means
  first adding `@repo/security`, `@repo/rate-limit`, and `@repo/backend`
  (plus `@repo/convex` for the http client) as workspace deps.
- `apps/mobile`: Expo Router app with Clerk native auth, Convex provider,
  tab and auth route groups, and `tw/` styled wrappers (view, text,
  animated, image) as the styling convention.
- `apps/desktop`: Electron (electron-vite) with typed IPC (a `PreloadApi`
  exposed over contextBridge) and a Convex provider in the renderer.
  Independent of the web apps.
- `apps/docs`: Mintlify docs site (`docs.json` plus MDX). Depth: `mintlify`
  skill.
- `apps/email`: React Email preview server for `packages/email` templates.
- `apps/storybook`: stories for the design system, with a `generate-stories`
  script.
