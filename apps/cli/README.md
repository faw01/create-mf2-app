# mf²

[![version](https://img.shields.io/npm/v/create-mf2-app?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/create-mf2-app)
[![downloads](https://img.shields.io/npm/dm/create-mf2-app?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/create-mf2-app)
[![license](https://img.shields.io/npm/l/create-mf2-app?style=flat&colorA=000000&colorB=000000)](https://github.com/faw01/create-mf2-app/blob/main/LICENSE)

The startup-in-a-command monorepo built for the agent era.

One command scaffolds a Turborepo with eight apps across web, mobile, and desktop, 22 shared packages, and agent instructions that already know the codebase. Everything boots with zero keys — a blank env value just disables that integration.

[Website →](https://mf2.dev)

## Quick Start

```bash
bunx create-mf2-app my-app
cd my-app
bun run dev
```

Prefer GitHub? Click **Use this template** on the [template repository](https://github.com/faw01/mf2).

The CLI prompts for a project name and package manager, copies the template, creates ready-to-fill `.env.local` and `.env.production` files, installs dependencies, and makes an initial commit. Fill in API keys as you need them and start building.

## Apps

```
apps/
  app/            Main SaaS application (Next.js, App Router)
  web/            Marketing website
  api/            Webhooks, cron jobs, external integrations
  mobile/         React Native + Expo mobile app
  desktop/        Electron desktop app (macOS, Windows, Linux)
  docs/           Documentation (Mintlify)
  email/          Email templates (React Email)
  storybook/      Component workshop
```

## Packages

```
packages/
  backend/               Convex database, auth sync, AI agents, workflows
  convex/                Convex + Clerk React provider
  storage/               Convex file storage and Vercel Blob

  design-system/         50+ shadcn/ui components with dark mode
  design-system-native/  React Native UI components (NativeWind)

  auth/                  Clerk authentication and route protection
  payments/              Stripe via @convex-dev/stripe
  ai/                    Vercel AI SDK, multi-model routing

  analytics/             PostHog event tracking and sessions
  cms/                   BaseHub headless CMS
  collaboration/         Liveblocks cursors and presence
  email/                 Resend transactional email
  feature-flags/         Vercel feature flags with overrides
  internationalization/  next-intl translations
  notifications/         Knock in-app notification feeds
  seo/                   Metadata, JSON-LD, Open Graph
  webhooks/              Svix outbound webhook delivery

  observability/         Sentry error tracking, BetterStack logging
  rate-limit/            Upstash Redis rate limiting
  security/              Arcjet bot detection, Nosecone secure headers

  next-config/           Shared Next.js configuration
  typescript-config/     Shared tsconfig
```

Each app imports only the packages it needs. Five Convex Components (Stripe, Resend, Workflow, Action Retrier, Migrations) ship pre-installed. Stack details at [mf2.dev/docs/structure](https://mf2.dev/docs/structure).

## Built for Agents

`.agents/AGENTS.md` is the single agent entry point: essential commands, conventions, and pointers to the vendored skills. `AGENTS.md`, `CLAUDE.md`, and `.claude/CLAUDE.md` are one-line anchors that resolve to it, so every agent lands on the same instructions.

| File | Purpose |
|------|---------|
| `.agents/AGENTS.md` | Canonical agent instructions |
| `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md` | Anchors that resolve to `.agents/AGENTS.md` |
| `.agents/skills/` | 40+ vendored skills: Convex, Clerk, Expo, Stripe, shadcn, Turborepo, and more |
| `.claude/skills/` | Mirror of `.agents/skills/` for Claude Code |
| `.mcp.json` | MCP servers: Convex, Stripe, Clerk, PostHog, Vercel, Context7, Ultracite |

Tell your agent to use the `mf2` skill with your product idea: it maps the requirements onto the scaffold and plans a parallelized build.

## Security

Scaffolds ship with supply-chain defenses on: a three-day cooldown on newly published package versions (bun, pnpm, and npm), install scripts blocked by default, registry-only transitive resolution, and Arcjet bot detection with rate limiting at runtime.

## CLI

Pass the project name and flags to skip the interactive prompts:

```bash
bunx create-mf2-app my-app --package-manager bun
bunx create-mf2-app --name my-app --disable-git
```

| Flag | Effect |
|------|--------|
| `[name]` | Set project name (positional) |
| `--name <name>` | Set project name (wins over the positional) |
| `--package-manager <manager>` | bun (default), npm, yarn, or pnpm |
| `--disable-git` | Skip git initialization |

For npm, yarn, or pnpm, the CLI converts `workspace:*` dependencies, rewrites bun-specific scripts, and adjusts configuration files.

## Deploy

Each app deploys as a separate Vercel project:

1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Set the root directory (`apps/app`, `apps/web`, or `apps/api`)
3. Add environment variables from `.env.production`
4. Push to `main` and Vercel rebuilds only affected apps

Documentation (`apps/docs`) deploys via [Mintlify](https://mintlify.com); the backend via `bunx convex deploy`.

## Documentation

Commands, environment setup, and the full stack reference live at [mf2.dev/docs](https://mf2.dev/docs).

Contributions welcome — see the [Contributing Guide](https://github.com/faw01/create-mf2-app/blob/main/.github/CONTRIBUTING.md).

## License

MIT © [Ocarina Labs](https://ocarinalabs.ai)
