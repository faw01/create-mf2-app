# mf²

The startup-in-a-command monorepo built for the agent era.

```
bunx create-mf2-app
```

[![npm version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![License][license-image]][license-url]
[![GitHub Stars][stars-image]][github-url]

## Quick Start

```bash
bunx create-mf2-app my-app
cd my-app
bun run dev
```

Or use the [template repository](https://github.com/faw01/mf2) on GitHub: click **Use this template** to create a new repo from it.

The CLI scaffolds a Turborepo monorepo with eight apps across web, mobile, and desktop, plus 22 shared packages. It prompts for a project name and package manager, copies the template, creates ready-to-fill `.env.local` and `.env.production` files, installs dependencies, and creates an initial git commit.

Everything boots with zero keys: a blank env value just disables that integration. Fill in API keys as you need them and start building.

## What You Get

```
apps/
  app/            Main SaaS application (Next.js, App Router)
  web/            Marketing website
  api/            Webhooks, cron jobs, external integrations
  desktop/        Electron desktop app (macOS, Windows, Linux)
  docs/           Documentation (Mintlify)
  email/          Email templates (React Email)
  mobile/         React Native + Expo mobile app
  storybook/      Component workshop

packages/
  backend/        Convex database, auth sync, AI agents, workflows
  design-system/  50+ shadcn/ui components with dark mode
  design-system-native/ React Native UI components (NativeWind)
  auth/           Clerk authentication and route protection
  payments/       Stripe via @convex-dev/stripe
  ai/             Vercel AI SDK, multi-model routing
  analytics/      PostHog event tracking and sessions
  observability/  Sentry error tracking, BetterStack logging
  security/       Arcjet bot detection, Nosecone secure headers
  rate-limit/     Upstash Redis rate limiting
  storage/        Convex file storage and Vercel Blob
  email/          Resend transactional email
  cms/            BaseHub headless CMS
  seo/            Metadata, JSON-LD, Open Graph
  notifications/  Knock in-app notification feeds
  collaboration/  Liveblocks cursors and presence
  webhooks/       Svix outbound webhook delivery
  feature-flags/  Vercel feature flags with overrides
  internationalization/ next-intl translations
  convex/         Convex + Clerk React provider
  next-config/    Shared Next.js configuration
  typescript-config/ Shared tsconfig
```

Each app imports only the packages it needs. Five Convex Components (Stripe, Resend, Workflow, Action Retrier, Migrations) ship pre-installed. Stack details at [mf2.dev/docs/structure](https://mf2.dev/docs/structure).

## AI Agent Setup

Every scaffold ships agent-ready:

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project structure, commands, Convex conventions |
| `.claude/CLAUDE.md` | Ultracite standards, Bun APIs, Convex patterns |
| `.claude/skills/`, `.agents/skills/` | Skills for Clerk, Expo, shadcn, Turborepo, Vercel patterns |
| `.mcp.json` | MCP servers: Convex, Stripe, Clerk, PostHog, Vercel, Context7, Ultracite |

## Commands

Project scripts (dev, build, env, upgrades) are documented at [mf2.dev/docs/commands](https://mf2.dev/docs/commands).

## CLI

Pass the project name and flags to skip interactive prompts:

```bash
bunx create-mf2-app my-app --package-manager bun
bunx create-mf2-app --name my-app --disable-git
```

The name can be given positionally or with `--name`; the flag wins if both are present.

| Flag | Effect |
|------|--------|
| `[name]` | Set project name (positional) |
| `--name <name>` | Set project name |
| `--package-manager <manager>` | bun (default), npm, yarn, or pnpm |
| `--disable-git` | Skip git initialization |

For npm, yarn, or pnpm, the CLI converts `workspace:*` dependencies, rewrites bun-specific scripts, and adjusts configuration files.

## Deploy

Each app deploys as a separate Vercel project:

1. Import your repo at [vercel.com/new](https://vercel.com/new)
2. Set the root directory (`apps/app`, `apps/web`, or `apps/api`)
3. Add environment variables from `.env.production`
4. Push to `main` and Vercel rebuilds only affected apps

Documentation (`apps/docs`) deploys via [Mintlify](https://mintlify.com), not Vercel.

## Documentation

Full docs at [mf2.dev/docs](https://mf2.dev/docs).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit with [conventional commits](https://www.conventionalcommits.org/)
4. Open a pull request

## License

MIT © [Ocarina Labs](https://ocarinalabs.ai)

[npm-image]: https://img.shields.io/npm/v/create-mf2-app?color=0b7285&logoColor=0b7285
[npm-url]: https://www.npmjs.com/package/create-mf2-app
[downloads-image]: https://img.shields.io/npm/dm/create-mf2-app?color=364fc7&logoColor=364fc7
[license-image]: https://img.shields.io/npm/l/create-mf2-app
[license-url]: https://github.com/faw01/create-mf2-app/blob/main/LICENSE
[stars-image]: https://img.shields.io/github/stars/faw01/create-mf2-app?style=social
[github-url]: https://github.com/faw01/create-mf2-app
