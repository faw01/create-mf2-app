# mf²

SaaS monorepo built with Next.js 16, Convex, and the Vercel ecosystem. Scaffolded by [mf²](https://mf2.dev).

## Philosophy

AI agents write most of the code now. The bottleneck is how well your codebase helps an agent understand what exists, what to change, and whether it broke anything. mf² keeps the source of truth in typed code, not dashboards.

- **Fast** -- quick to build, run, deploy, and iterate on
- **Cheap** -- free to start with services that scale with you
- **Opinionated** -- integrated tooling designed to work together
- **Modern** -- latest stable features with healthy community support
- **Safe** -- end-to-end type safety, plus bot detection, secure headers, and rate limiting by default

Convex collapses your backend into TypeScript files in one `convex/` folder. Any agent reads the schema, writes a query, and gets a type error if it's wrong. Clerk ships pre-configured -- agents never touch auth setup.

Read the full philosophy at [mf2.dev/docs/philosophy](https://mf2.dev/docs/philosophy).

## Getting Started

```bash
bun install
bun run dev
```

Tip: `bunx turbo dev --filter=app` starts just the main app instead of all ten.

No keys are required to boot. The CLI already created `.env.local` and `.env.production` from each `.env.example`, and a blank or missing variable simply disables that integration. Validation only fails when a variable is set to a malformed value.

Add keys when you want the features they unlock:

| Service | Variables | Unlocks | Dashboard |
|---------|-----------|---------|-----------|
| Clerk | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Sign-in and sign-up | [dashboard.clerk.com](https://dashboard.clerk.com) |
| Convex | `NEXT_PUBLIC_CONVEX_URL` (auto-synced, see below) | Database and realtime backend | [dashboard.convex.dev](https://dashboard.convex.dev) |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Payments | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |

Convex needs no dashboard key, and no deployment for types: `packages/backend/convex/_generated/` is committed, so `import { api } from "@repo/backend"` typechecks on a fresh clone with zero setup.

To run the backend, run `bunx convex dev` once in `packages/backend`. What it does depends on who is running it:

- **Not logged in to Convex** (or stdin is not a terminal, which covers coding agents): it creates a free anonymous deployment on your machine. No account needed.
- **Logged in at a terminal**: it prompts you to pick or create a cloud project on your account. To force the accountless local path instead, run it with `CONVEX_AGENT_MODE=anonymous`.

Either way it writes the deployment URL to `packages/backend/.env.local`, and the backend dev task copies it into the `.env.local` files of `apps/app` and `apps/mobile` the next time `bun run dev` starts. Stick with plain `bunx convex dev`: subcommands like `npx convex deployment create local` require a logged-in account and will refuse with "Cannot create a deployment in anonymous mode".

Cloned this repo instead of scaffolding? Env files are gitignored, so copy each `.env.example` to `.env.local` when you need to add keys (`bun run env:check` shows which files and keys are missing).

## Dev URLs

| App | URL |
|-----|-----|
| App | http://localhost:3000 |
| Web | http://localhost:3001 |
| API | http://localhost:3002 |
| Email | http://localhost:3003 |
| Docs | http://localhost:3004 |
| Storybook | http://localhost:6006 |

## Project Structure

### Apps

| App | Path | Description |
|-----|------|-------------|
| `app` | `apps/app` | Main SaaS application (authenticated dashboard, core product) |
| `web` | `apps/web` | Marketing website and landing pages |
| `api` | `apps/api` | Webhooks, cron jobs, external integrations |
| `desktop` | `apps/desktop` | Electron desktop app (macOS, Windows, Linux) |
| `docs` | `apps/docs` | Documentation site (Mintlify) |
| `email` | `apps/email` | Email templates (React Email) |
| `mobile` | `apps/mobile` | React Native + Expo mobile app |
| `storybook` | `apps/storybook` | Component library viewer |

### Packages

| Package | Path | Description |
|---------|------|-------------|
| `backend` | `packages/backend` | Convex database, auth sync, AI agents, workflows |
| `convex` | `packages/convex` | Convex + Clerk React provider |
| `design-system` | `packages/design-system` | 50+ shadcn/ui components with dark mode |
| `design-system-native` | `packages/design-system-native` | React Native UI components (NativeWind) |
| `auth` | `packages/auth` | Clerk authentication and route protection |
| `payments` | `packages/payments` | Stripe via `@convex-dev/stripe` |
| `ai` | `packages/ai` | Vercel AI SDK, multi-model routing |
| `analytics` | `packages/analytics` | PostHog event tracking and sessions |
| `observability` | `packages/observability` | Sentry error tracking, BetterStack logging |
| `security` | `packages/security` | Arcjet bot detection, Nosecone secure headers |
| `rate-limit` | `packages/rate-limit` | Upstash Redis rate limiting |
| `storage` | `packages/storage` | Convex file storage and Vercel Blob |
| `email` | `packages/email` | Resend transactional email |
| `cms` | `packages/cms` | BaseHub headless CMS |
| `seo` | `packages/seo` | Metadata, JSON-LD, Open Graph |
| `notifications` | `packages/notifications` | Knock in-app notification feeds |
| `collaboration` | `packages/collaboration` | Liveblocks cursors and presence |
| `webhooks` | `packages/webhooks` | Svix outbound webhook delivery |
| `feature-flags` | `packages/feature-flags` | Vercel feature flags with overrides |
| `internationalization` | `packages/internationalization` | next-intl translations |
| `next-config` | `packages/next-config` | Shared Next.js configuration |
| `typescript-config` | `packages/typescript-config` | Shared tsconfig |

Route-specific components go in a `components/` folder inside the route group (for example `app/(authenticated)/components/`). Shared components promote to the app's top-level `components/` folder or `@repo/design-system`.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) with App Router |
| Language | TypeScript end-to-end |
| Database | [Convex](https://convex.dev) -- real-time, reactive, serverless |
| Auth | [Clerk](https://clerk.com) -- 80+ OAuth providers, webhook sync to Convex |
| Payments | [Stripe](https://stripe.com) via [`@convex-dev/stripe`](https://www.convex.dev/components/stripe) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) -- multi-model routing, streaming |
| Email | [Resend](https://resend.com) + [React Email](https://react.email) |
| Analytics | [PostHog](https://posthog.com) -- events, sessions, feature flags |
| Error Tracking | [Sentry](https://sentry.io) + [BetterStack](https://betterstack.com) |
| Security | [Arcjet](https://arcjet.com) -- bot detection, rate limiting, DDoS protection |
| Monorepo | [Turborepo](https://turbo.build) + [Bun](https://bun.sh) |
| Deployment | [Vercel](https://vercel.com) |
| Code Quality | [Biome](https://biomejs.dev) via [Ultracite](https://docs.ultracite.ai) |

## Convex Backend

Backend code lives at `packages/backend/convex/`. Schema at `convex/schema.ts`, HTTP endpoints at `convex/http.ts`.

```bash
bunx convex dev       # isolated dev instance per developer
bunx convex deploy    # deploy to production
```

Generated types in `convex/_generated/` are committed, per [Convex's own recommendation](https://docs.convex.dev/understanding/best-practices/other-recommendations#check-generated-code-into-version-control), so typecheck and tests need no deployment. `bunx convex dev` regenerates them as you change the schema or add modules; commit the result.

Five [Convex Components](https://www.convex.dev/components) ship pre-installed:

| Component | Package | Purpose |
|-----------|---------|---------|
| Stripe | `@convex-dev/stripe` | Checkout sessions, subscriptions, webhook sync |
| Resend | `@convex-dev/resend` | Transactional email with event tracking |
| Workflow | `@convex-dev/workflow` | Durable flows with retries and delays |
| Action Retrier | `@convex-dev/action-retrier` | Automatic retry with backoff for external calls |
| Migrations | `@convex-dev/migrations` | Schema migrations for live data without downtime |

All functions require argument and return validators. See the Convex skills in `.agents/skills/` for full conventions.

## Commands

All commands run from the project root.

### Development

| Command | What it does |
|---------|--------------|
| `bun run dev` | Start all apps in development mode |
| `bunx turbo dev --filter=app` | Start a single app |
| `bunx convex dev` | Start Convex backend separately |

### Code Quality

| Command | What it does |
|---------|--------------|
| `bun run check` | Lint and format check (Biome) |
| `bun run fix` | Auto-fix linting and formatting issues |
| `bun run convex-lint` | Lint Convex functions (ESLint) |

### Build and Test

| Command | What it does |
|---------|--------------|
| `bun run build` | Build all apps (runs tests first) |
| `bun run test` | Run all tests (Vitest) |
| `bun run analyze` | Bundle analysis (`ANALYZE=true`) |
| `bunx turbo build --filter=app` | Build a single app |

### Environment

| Command | What it does |
|---------|--------------|
| `bun run env:check` | List env files and keys that are still blank |
| `bun run env:push` | Sync env vars to Vercel and Convex |

### Upgrading

| Command | What it does |
|---------|--------------|
| `bun run bump-deps` | Update all npm dependencies to latest |
| `bun run bump-ui` | Update all shadcn/ui components, then regenerate their Storybook stories |
| `bun run generate-stories` | Regenerate Storybook stories from the upstream shadcn/ui demos for every local design-system ui component (runs automatically after `bump-ui`; composite showcases and files marked `generate-stories: skip` are left untouched) |
| `bun run bump-ui-native` | Update all React Native Reusables components |
| `bun run clean` | Remove all `node_modules` directories |

### Turbo Filtering

```bash
bunx turbo dev --filter=app           # only the main app
bunx turbo build --filter=web         # only the marketing site
bunx turbo test --filter=backend      # only backend tests
bunx turbo build --filter=app...      # app and all its dependencies
```

## Environment Variables

Validated at build time via `@t3-oss/env-nextjs`. Import from `@/env`, not `process.env`.

Every schema sets `emptyStringAsUndefined`, so a blank value behaves exactly like a missing one: the integration is disabled and validation passes. Nothing is required just to boot; validation only rejects malformed values (for example a PostHog key that does not start with `phc_`).

### Required for core features

Sign-in, data, and payments do not work until these are set.

| Variable | Service | Dashboard |
|----------|---------|-----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `NEXT_PUBLIC_CONVEX_URL` | Convex | [dashboard.convex.dev](https://dashboard.convex.dev) |
| `STRIPE_SECRET_KEY` | Stripe | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) |

### Optional

Blank or absent means the integration is off.

| Variable | Service | Dashboard |
|----------|---------|-----------|
| `RESEND_TOKEN` | Resend | [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM` | Resend | -- |
| `RESEND_WEBHOOK_SECRET` | Resend (Convex webhook signing secret) | [resend.com/webhooks](https://resend.com/webhooks) |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog | [app.posthog.com/project/settings](https://app.posthog.com/project/settings) |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog | -- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics | [analytics.google.com](https://analytics.google.com) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry | [sentry.io](https://sentry.io) |
| `SENTRY_ORG` | Sentry | -- |
| `SENTRY_PROJECT` | Sentry | -- |
| `BETTERSTACK_API_KEY` | BetterStack | [betterstack.com/logs](https://betterstack.com/logs) |
| `BETTERSTACK_URL` | BetterStack | -- |
| `ARCJET_KEY` | Arcjet | [app.arcjet.com](https://app.arcjet.com) |
| `SVIX_TOKEN` | Svix | [dashboard.svix.com](https://dashboard.svix.com) |
| `KNOCK_SECRET_API_KEY` | Knock | [dashboard.knock.app](https://dashboard.knock.app) |
| `NEXT_PUBLIC_KNOCK_API_KEY` | Knock | -- |
| `NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID` | Knock | -- |
| `LIVEBLOCKS_SECRET` | Liveblocks | [liveblocks.io/dashboard](https://liveblocks.io/dashboard) |
| `BASEHUB_TOKEN` | BaseHub | [basehub.com](https://basehub.com) |
| `UPSTASH_REDIS_REST_URL` | Upstash | [console.upstash.com](https://console.upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | -- |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway | -- |
| `AI_GATEWAY_URL` | Vercel AI Gateway | -- |
| `CLERK_WEBHOOK_SECRET` | Clerk | [dashboard.clerk.com](https://dashboard.clerk.com) |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk (issuer URL from the JWT template named `convex`) | [JWT template guide](https://clerk.com/docs/integrations/databases/convex) |
| `FLAGS_SECRET` | Feature Flags | -- |

Without `BASEHUB_TOKEN`, the marketing site (`apps/web`) still renders; blog and legal content are empty and the console prints `Skipping CMS: set BASEHUB_TOKEN to enable`.

Full reference at [mf2.dev/docs/setup/env](https://mf2.dev/docs/setup/env).

## Deploy

Each app deploys as a separate Vercel project:

1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Set the root directory (`apps/app`, `apps/web`, or `apps/api`)
3. Add environment variables from `.env.production`
4. Push to `main` -- Vercel rebuilds only affected apps

Documentation (`apps/docs`) deploys via [Mintlify](https://mintlify.com).

Backend: `bunx convex deploy`.

## Code Conventions

Ultracite (Biome) handles formatting and linting. A Lefthook pre-commit hook runs `ultracite fix` on staged files.

```bash
bun run fix             # auto-fix before committing
bun run check           # verify everything passes
```

Key conventions:
- Use `bun` for all package management
- Use `type` keyword, not `interface`
- All Convex functions require argument and return validators
- `const` by default, `let` only when reassignment is needed

`.agents/AGENTS.md` is the agent entry point with the essential commands. `AGENTS.md`, `CLAUDE.md`, and `.claude/CLAUDE.md` all resolve to it. Conventions live in the vendored skills under `.agents/skills/`.

## AI Agent Setup

| File | Purpose |
|------|---------|
| `.agents/AGENTS.md` | Agent entry point: essential commands, points to the vendored skills |
| `AGENTS.md` | Anchor that imports `.agents/AGENTS.md` |
| `CLAUDE.md` → `.claude/CLAUDE.md` | Anchor chain for Claude Code, resolves to `.agents/AGENTS.md` |
| `.claude/skills/`, `.agents/skills/` | Pre-built skills for Convex, Clerk, Expo, Stripe, shadcn, Turborepo, and more |
| `.mcp.json` | MCP servers: Convex, Stripe, Clerk, PostHog, Vercel, Context7, Ultracite |

Agents get typed schema in `packages/backend/convex/`, type-safe env via `@/env`, and colocated components in route-group `components/` folders. The `mf2` skill is the entry point for building: tell your agent to use it with your product idea and it maps the requirements onto the scaffold and plans a parallelized build.

## Links

| Resource | URL |
|----------|-----|
| Documentation | [mf2.dev/docs](https://mf2.dev/docs) |
| Convex Dashboard | [dashboard.convex.dev](https://dashboard.convex.dev) |
| Clerk Dashboard | [dashboard.clerk.com](https://dashboard.clerk.com) |
| Stripe Dashboard | [dashboard.stripe.com](https://dashboard.stripe.com) |
| Vercel Dashboard | [vercel.com/dashboard](https://vercel.com/dashboard) |
| PostHog | [app.posthog.com](https://app.posthog.com) |
| GitHub | [github.com/faw01/create-mf2-app](https://github.com/faw01/create-mf2-app) |
