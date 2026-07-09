# v2.0.5 (Tue Feb 24 2026)

## 2.7.1

### Patch Changes

- a8238d6: export the convex http client, add RESEND_FROM and ai to the backend, sharpen skill docs

## 2.7.0

### Minor Changes

- a4d7f5e: Upgrade Ultracite to 7.9 (Biome 2.5.2 with the newly stabilized rules and the tightened cross-linter rule graph) and fix every new violation across the template and CLI. Bolt React Doctor into scaffolds as `bun run doctor` for the React-specific checks lint rules miss: the "You Might Not Need an Effect" family, render performance, hydration, server-component, and security scans. Scaffolds ship scoring 100/100: doctor configs ignore vendored shadcn code and generated stories, and every first-party finding is fixed — uncleaned carousel timers, sequential awaits parallelized across pages and Convex cascade deletes, the Svix portal iframe sandboxed, legal pages showing the CMS last-modified date instead of render time, Zod 4 top-level string formats, hoisted Intl formatters, and a URL-change re-render removed from the language switcher. Also strips narrative comments across the CLI and template, points the scaffold's root `CLAUDE.md` directly at the canonical `.agents/AGENTS.md`, rewrites the README, and hardens the supply chain: a three-day minimum release age cooldown for bun (`bunfig.toml`), pnpm (`pnpm-workspace.yaml`, plus `blockExoticSubdeps` and `trustPolicy: no-downgrade`), and npm (scaffold-time `.npmrc` with `min-release-age`, `allow-git=root`, `allow-remote=root`); a security audit that patched the Clerk Expo authorization bypass (GHSA-w24r-5266-9c3c) and added overrides clearing langsmith, postcss, and js-yaml advisories.

## 2.6.0

### Minor Changes

- 6a6fa6f: ship agent files and the mf2 skill with scaffolds, proper npm/yarn/pnpm support, `bunx create-mf2-app my-app` just works, env files created for you
- 6a6fa6f: update everything to latest (ai sdk 7, expo 57, electron 43, convex 1.42, next 16.2), fix security gaps, boot with zero keys, stories regenerate from shadcn demos

### Patch Changes

- 6a6fa6f: fix convex url wiring, convex-lint, story types, docs drift

## 2.5.0

### Minor Changes

- 0b2c3f8: Add Electron desktop app scaffold with electron-vite, electron-builder, and shared design system. Add electron and electron-renderer TypeScript configs. Add react-native-reusables native UI components. Update agent skills to .agents directory. Update dependencies across all template apps and packages.

## 2.4.0

### Minor Changes

- 2202e2d: Update all dependencies including Next.js 16.2.1 (security patches), TypeScript 6.0, Convex 1.34, Storybook 10.3, and remove deprecated baseUrl from all tsconfig files

### Patch Changes

- 9fd3195: Remove next-forge remnants: Prisma extension recommendation, dead biome exclusion, and rebrand all user-facing references from next-forge to mf²

## 2.3.0

### Minor Changes

- 85a416e: Align with next-forge v6. Bun-first runtime, graceful degradation for all optional services, Sentry namespace imports, updated dependencies, and zero-env boot support.

  - Add `bun --bun` prefix to all Next.js dev/build/start scripts
  - Add `bunVersion: "1.x"` to all vercel.json files
  - Migrate all @repo deps to `workspace:*`
  - Refactor observability to Sentry namespace imports with onRequestError and onRouterTransitionStart exports
  - Add graceful degradation to analytics, payments, email, CMS, auth, and feature flags
  - Refactor CMS with QueryGenqlSelection and getPostsMeta
  - Harden i18n locale negotiation with try-catch and wildcard filter
  - Remove env.local from template for zero-env boot
  - Bump all dependencies (Next 16.1.6, React 19.2.4, Clerk 7.x, AI SDK 6.x, Tailwind 4.2.1, Sentry 10.43.0)
  - Bump shadcn/ui and native components
  - Add READMEs for all apps and packages

## 2.2.0

### Minor Changes

- 3684e29: Add React Native + Expo mobile app support with shared package native entrypoints

## 2.1.12

### Patch Changes

- 4a4823f: Sync template root dependency versions for `@types/node`, `lefthook`, and `lint-staged`.

## 2.1.11

### Patch Changes

- 9de5946: Add `@tailwindcss/postcss` as a devDependency to `apps/app` and `apps/web` in the template. With Bun's isolated linker, Next.js Turbopack could not resolve the PostCSS plugin from the design-system package scope, causing build failures on scaffolded projects.

## 2.1.10

### Patch Changes

- bfd290e: Switch docs theme to mint and add .mintignore to exclude AGENTS.md from parser

## 2.1.9

### Patch Changes

- 2a6659d: Make all third-party services optional for zero-config dev: analytics, CMS, Convex, AI, email, and payments gracefully skip when env vars are missing

## 2.1.8

### Patch Changes

- 65576c2: Treat empty environment variable strings as undefined to allow dev server to start without configuration

## 2.1.7

### Patch Changes

- fd7049c: Relax next peer dependency in feature-flags and skip CMS dev when BASEHUB_TOKEN is not set

## 2.1.6

### Patch Changes

- 7206808: Update docs from mintlify to mint CLI and add as devDependency

## 2.1.5

### Patch Changes

- b7f675d: Fix missing .env.example and .env.local files in scaffolded projects

## 2.1.4

### Patch Changes

- e2416fd: Fix missing .gitignore in scaffolded projects and show progress during git commit

## 2.1.3

### Patch Changes

- 054833b: Prevent initial commit from hanging and add docs link to CLI output

## 2.1.2

### Patch Changes

- 952ffa7: Fix dynamic require error by keeping commander as external dependency

## 2.1.1

### Patch Changes

- 55dad3c: Bundle all dependencies to fix sisteransi resolution error when running via bunx

## 2.1.0

### Minor Changes

- 71689b9: Update CLI branding and fix initial commit hanging due to lefthook pre-commit hook

#### ⚠️ Pushed to `main`

- fix(ci): remove node_modules without reinstall before auto ([@faw01](https://github.com/faw01))
- fix(ci): reinstall deps in cli before auto for git tags ([@faw01](https://github.com/faw01))
- fix(cli): simplify README markup for npm rendering ([@faw01](https://github.com/faw01))
- fix(cli): add repository metadata for npm provenance ([@faw01](https://github.com/faw01))
- fix(ci): require npm 11.5+ for trusted publish ([@faw01](https://github.com/faw01))
- fix(ci): disable auto npm rc token for oidc publish ([@faw01](https://github.com/faw01))
- fix(ci): use npm trusted publishing via oidc ([@faw01](https://github.com/faw01))
- fix(ci): remove bun node_modules before auto shipit ([@faw01](https://github.com/faw01))
- fix(cli): replace workspace protocol with wildcard for npm compat ([@faw01](https://github.com/faw01))
- fix(ci): run auto shipit from cli dir and add write permissions ([@faw01](https://github.com/faw01))
- fix(ci): add autorc to publish cli subpackage to npm ([@faw01](https://github.com/faw01))
- fix(ci): add git identity for auto shipit ([@faw01](https://github.com/faw01))
- fix(ci): replace pnpm with bun in release workflow ([@faw01](https://github.com/faw01))
- fix(turbo): add .next to build outputs for vercel cache ([@faw01](https://github.com/faw01))
- fix(cli): replace exec with spawn to fix install hanging ([@faw01](https://github.com/faw01))
- docs(template): rewrite README for mf² ([@faw01](https://github.com/faw01))
- fix(template): rename heading ([@faw01](https://github.com/faw01))
- refactor(web): replace lucide github icon with custom svg ([@faw01](https://github.com/faw01))
- feat(web): add dashed border lines and github icon to landing page ([@faw01](https://github.com/faw01))
- docs(readme): align with docs, remove community section, fix links ([@faw01](https://github.com/faw01))
- docs(cli): add README and rebrand to Ocarina Labs ([@faw01](https://github.com/faw01))
- feat(docs): update logo to ➤ arrow icon ([@faw01](https://github.com/faw01))
- fix(web): move vercel.json to apps/web ([@faw01](https://github.com/faw01))
- chore(config): add .vercel to gitignore ([@faw01](https://github.com/faw01))
- fix(deploy): fix mintlify docs rewrite to proxy from root ([@faw01](https://github.com/faw01))
- refactor(web): simplify landing page and remove shader ([@faw01](https://github.com/faw01))
- feat(seo): add metadata and json-ld package ([@faw01](https://github.com/faw01))
- feat(web): add landing page with shader splash screen ([@faw01](https://github.com/faw01))
- feat(design-system): add shadcn/ui components and theme ([@faw01](https://github.com/faw01))
- feat(next-config): add shared next.js configuration ([@faw01](https://github.com/faw01))
- feat(typescript-config): add nextjs, react-library, and convex configs ([@faw01](https://github.com/faw01))
- chore(config): add .next to gitignore ([@faw01](https://github.com/faw01))
- docs(docs): add agent workflow note to commands page ([@faw01](https://github.com/faw01))
- docs(docs): add agent context to structure and colocation pages ([@faw01](https://github.com/faw01))
- docs(docs): add agent-first narrative and roadmap page ([@faw01](https://github.com/faw01))
- fix(deploy): update mintlify subdomain to ocarinalabs ([@faw01](https://github.com/faw01))
- docs(readme): update branding and project description ([@faw01](https://github.com/faw01))
- chore(deps): add lockfile ([@faw01](https://github.com/faw01))
- feat(scripts): add story generation script ([@faw01](https://github.com/faw01))
- chore(dx): add editor and mcp configs ([@faw01](https://github.com/faw01))
- ci(github): add release workflow and dependabot ([@faw01](https://github.com/faw01))
- chore(github): add issue and pr templates ([@faw01](https://github.com/faw01))
- chore(github): add community health files ([@faw01](https://github.com/faw01))
- feat(docs): add documentation site ([@faw01](https://github.com/faw01))
- refactor(www): remove old website ([@faw01](https://github.com/faw01))
- feat(cli): add project template package scaffolds ([@faw01](https://github.com/faw01))
- feat(cli): add project template app scaffolds ([@faw01](https://github.com/faw01))
- feat(cli): add project template dx configs ([@faw01](https://github.com/faw01))
- feat(cli): add project template root configs ([@faw01](https://github.com/faw01))
- feat(cli): add cli build and init scripts ([@faw01](https://github.com/faw01))
- feat(cli): add new cli app with build system ([@faw01](https://github.com/faw01))
- refactor(cli): remove old fullstack-ai template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old fullstack template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old frontend template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old cli source and build output ([@faw01](https://github.com/faw01))
- feat(design-system): add shared design system package ([@faw01](https://github.com/faw01))
- feat(next-config): add shared next.js config package ([@faw01](https://github.com/faw01))
- feat(typescript-config): add shared typescript config package ([@faw01](https://github.com/faw01))
- chore(deploy): add vercel deployment config ([@faw01](https://github.com/faw01))
- chore(root): add bun and lefthook configs ([@faw01](https://github.com/faw01))
- chore(root): add biome linting and formatting config ([@faw01](https://github.com/faw01))
- chore(root): add turborepo pipeline config ([@faw01](https://github.com/faw01))
- refactor(root): migrate package.json to turborepo workspaces ([@faw01](https://github.com/faw01))
- chore(root): remove old root tsconfig ([@faw01](https://github.com/faw01))
- docs(project): update project instructions with ultracite standards ([@faw01](https://github.com/faw01))
- chore(license): update copyright to Ocarina Labs ([@faw01](https://github.com/faw01))
- chore: update deps for react2shell, remove oss stats ([@faw01](https://github.com/faw01))
- feat: add signature ([@faw01](https://github.com/faw01))
- fix: build errror ([@faw01](https://github.com/faw01))
- chore: cleanup comments and lint ([@faw01](https://github.com/faw01))
- feat: refactor ai template, made code more modular ([@faw01](https://github.com/faw01))
- feat: update links ([@faw01](https://github.com/faw01))
- feat: update www ([@faw01](https://github.com/faw01))
- feat: cleanup, init docs with cli and add ai template ([@faw01](https://github.com/faw01))
- feat: add half-assed docs ([@faw01](https://github.com/faw01))
- feat: cleanup and finalise frontend template, added back convex for oss ([@faw01](https://github.com/faw01))
- feat: make responsive ([@faw01](https://github.com/faw01))
- feat: rerun init ([@faw01](https://github.com/faw01))
- feat: forgot to update ([@faw01](https://github.com/faw01))
- feat: update footer and website ([@faw01](https://github.com/faw01))
- feat: finish landing ([@faw01](https://github.com/faw01))
- feat: add website and change cli header ([@faw01](https://github.com/faw01))
- feat: cli working, migrate from mf squared to mf2 ([@faw01](https://github.com/faw01))
- feat: prep base-frontend ([@faw01](https://github.com/faw01))
- feat: create claude files ([@faw01](https://github.com/faw01))
- chore: lint and cleanup ([@faw01](https://github.com/faw01))
- feat: split ([@faw01](https://github.com/faw01))
- feat: more updates ([@faw01](https://github.com/faw01))
- init ([@faw01](https://github.com/faw01))

#### Authors: 1

- faw ([@faw01](https://github.com/faw01))

---

# v2.0.4 (Tue Feb 24 2026)

#### ⚠️ Pushed to `main`

- fix(cli): simplify README markup for npm rendering ([@faw01](https://github.com/faw01))
- fix(cli): add repository metadata for npm provenance ([@faw01](https://github.com/faw01))
- fix(ci): require npm 11.5+ for trusted publish ([@faw01](https://github.com/faw01))
- fix(ci): disable auto npm rc token for oidc publish ([@faw01](https://github.com/faw01))
- fix(ci): use npm trusted publishing via oidc ([@faw01](https://github.com/faw01))
- fix(ci): remove bun node_modules before auto shipit ([@faw01](https://github.com/faw01))
- fix(cli): replace workspace protocol with wildcard for npm compat ([@faw01](https://github.com/faw01))
- fix(ci): run auto shipit from cli dir and add write permissions ([@faw01](https://github.com/faw01))
- fix(ci): add autorc to publish cli subpackage to npm ([@faw01](https://github.com/faw01))
- fix(ci): add git identity for auto shipit ([@faw01](https://github.com/faw01))
- fix(ci): replace pnpm with bun in release workflow ([@faw01](https://github.com/faw01))
- fix(turbo): add .next to build outputs for vercel cache ([@faw01](https://github.com/faw01))
- fix(cli): replace exec with spawn to fix install hanging ([@faw01](https://github.com/faw01))
- docs(template): rewrite README for mf² ([@faw01](https://github.com/faw01))
- fix(template): rename heading ([@faw01](https://github.com/faw01))
- refactor(web): replace lucide github icon with custom svg ([@faw01](https://github.com/faw01))
- feat(web): add dashed border lines and github icon to landing page ([@faw01](https://github.com/faw01))
- docs(readme): align with docs, remove community section, fix links ([@faw01](https://github.com/faw01))
- docs(cli): add README and rebrand to Ocarina Labs ([@faw01](https://github.com/faw01))
- feat(docs): update logo to ➤ arrow icon ([@faw01](https://github.com/faw01))
- fix(web): move vercel.json to apps/web ([@faw01](https://github.com/faw01))
- chore(config): add .vercel to gitignore ([@faw01](https://github.com/faw01))
- fix(deploy): fix mintlify docs rewrite to proxy from root ([@faw01](https://github.com/faw01))
- refactor(web): simplify landing page and remove shader ([@faw01](https://github.com/faw01))
- feat(seo): add metadata and json-ld package ([@faw01](https://github.com/faw01))
- feat(web): add landing page with shader splash screen ([@faw01](https://github.com/faw01))
- feat(design-system): add shadcn/ui components and theme ([@faw01](https://github.com/faw01))
- feat(next-config): add shared next.js configuration ([@faw01](https://github.com/faw01))
- feat(typescript-config): add nextjs, react-library, and convex configs ([@faw01](https://github.com/faw01))
- chore(config): add .next to gitignore ([@faw01](https://github.com/faw01))
- docs(docs): add agent workflow note to commands page ([@faw01](https://github.com/faw01))
- docs(docs): add agent context to structure and colocation pages ([@faw01](https://github.com/faw01))
- docs(docs): add agent-first narrative and roadmap page ([@faw01](https://github.com/faw01))
- fix(deploy): update mintlify subdomain to ocarinalabs ([@faw01](https://github.com/faw01))
- docs(readme): update branding and project description ([@faw01](https://github.com/faw01))
- chore(deps): add lockfile ([@faw01](https://github.com/faw01))
- feat(scripts): add story generation script ([@faw01](https://github.com/faw01))
- chore(dx): add editor and mcp configs ([@faw01](https://github.com/faw01))
- ci(github): add release workflow and dependabot ([@faw01](https://github.com/faw01))
- chore(github): add issue and pr templates ([@faw01](https://github.com/faw01))
- chore(github): add community health files ([@faw01](https://github.com/faw01))
- feat(docs): add documentation site ([@faw01](https://github.com/faw01))
- refactor(www): remove old website ([@faw01](https://github.com/faw01))
- feat(cli): add project template package scaffolds ([@faw01](https://github.com/faw01))
- feat(cli): add project template app scaffolds ([@faw01](https://github.com/faw01))
- feat(cli): add project template dx configs ([@faw01](https://github.com/faw01))
- feat(cli): add project template root configs ([@faw01](https://github.com/faw01))
- feat(cli): add cli build and init scripts ([@faw01](https://github.com/faw01))
- feat(cli): add new cli app with build system ([@faw01](https://github.com/faw01))
- refactor(cli): remove old fullstack-ai template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old fullstack template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old frontend template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old cli source and build output ([@faw01](https://github.com/faw01))
- feat(design-system): add shared design system package ([@faw01](https://github.com/faw01))
- feat(next-config): add shared next.js config package ([@faw01](https://github.com/faw01))
- feat(typescript-config): add shared typescript config package ([@faw01](https://github.com/faw01))
- chore(deploy): add vercel deployment config ([@faw01](https://github.com/faw01))
- chore(root): add bun and lefthook configs ([@faw01](https://github.com/faw01))
- chore(root): add biome linting and formatting config ([@faw01](https://github.com/faw01))
- chore(root): add turborepo pipeline config ([@faw01](https://github.com/faw01))
- refactor(root): migrate package.json to turborepo workspaces ([@faw01](https://github.com/faw01))
- chore(root): remove old root tsconfig ([@faw01](https://github.com/faw01))
- docs(project): update project instructions with ultracite standards ([@faw01](https://github.com/faw01))
- chore(license): update copyright to Ocarina Labs ([@faw01](https://github.com/faw01))
- chore: update deps for react2shell, remove oss stats ([@faw01](https://github.com/faw01))
- feat: add signature ([@faw01](https://github.com/faw01))
- fix: build errror ([@faw01](https://github.com/faw01))
- chore: cleanup comments and lint ([@faw01](https://github.com/faw01))
- feat: refactor ai template, made code more modular ([@faw01](https://github.com/faw01))
- feat: update links ([@faw01](https://github.com/faw01))
- feat: update www ([@faw01](https://github.com/faw01))
- feat: cleanup, init docs with cli and add ai template ([@faw01](https://github.com/faw01))
- feat: add half-assed docs ([@faw01](https://github.com/faw01))
- feat: cleanup and finalise frontend template, added back convex for oss ([@faw01](https://github.com/faw01))
- feat: make responsive ([@faw01](https://github.com/faw01))
- feat: rerun init ([@faw01](https://github.com/faw01))
- feat: forgot to update ([@faw01](https://github.com/faw01))
- feat: update footer and website ([@faw01](https://github.com/faw01))
- feat: finish landing ([@faw01](https://github.com/faw01))
- feat: add website and change cli header ([@faw01](https://github.com/faw01))
- feat: cli working, migrate from mf squared to mf2 ([@faw01](https://github.com/faw01))
- feat: prep base-frontend ([@faw01](https://github.com/faw01))
- feat: create claude files ([@faw01](https://github.com/faw01))
- chore: lint and cleanup ([@faw01](https://github.com/faw01))
- feat: split ([@faw01](https://github.com/faw01))
- feat: more updates ([@faw01](https://github.com/faw01))
- init ([@faw01](https://github.com/faw01))

#### Authors: 1

- faw ([@faw01](https://github.com/faw01))

---

# v2.0.3 (Tue Feb 24 2026)

#### ⚠️ Pushed to `main`

- fix(cli): add repository metadata for npm provenance ([@faw01](https://github.com/faw01))
- fix(ci): require npm 11.5+ for trusted publish ([@faw01](https://github.com/faw01))
- fix(ci): disable auto npm rc token for oidc publish ([@faw01](https://github.com/faw01))
- fix(ci): use npm trusted publishing via oidc ([@faw01](https://github.com/faw01))
- fix(ci): remove bun node_modules before auto shipit ([@faw01](https://github.com/faw01))
- fix(cli): replace workspace protocol with wildcard for npm compat ([@faw01](https://github.com/faw01))
- fix(ci): run auto shipit from cli dir and add write permissions ([@faw01](https://github.com/faw01))
- fix(ci): add autorc to publish cli subpackage to npm ([@faw01](https://github.com/faw01))
- fix(ci): add git identity for auto shipit ([@faw01](https://github.com/faw01))
- fix(ci): replace pnpm with bun in release workflow ([@faw01](https://github.com/faw01))
- fix(turbo): add .next to build outputs for vercel cache ([@faw01](https://github.com/faw01))
- fix(cli): replace exec with spawn to fix install hanging ([@faw01](https://github.com/faw01))
- docs(template): rewrite README for mf² ([@faw01](https://github.com/faw01))
- fix(template): rename heading ([@faw01](https://github.com/faw01))
- refactor(web): replace lucide github icon with custom svg ([@faw01](https://github.com/faw01))
- feat(web): add dashed border lines and github icon to landing page ([@faw01](https://github.com/faw01))
- docs(readme): align with docs, remove community section, fix links ([@faw01](https://github.com/faw01))
- docs(cli): add README and rebrand to Ocarina Labs ([@faw01](https://github.com/faw01))
- feat(docs): update logo to ➤ arrow icon ([@faw01](https://github.com/faw01))
- fix(web): move vercel.json to apps/web ([@faw01](https://github.com/faw01))
- chore(config): add .vercel to gitignore ([@faw01](https://github.com/faw01))
- fix(deploy): fix mintlify docs rewrite to proxy from root ([@faw01](https://github.com/faw01))
- refactor(web): simplify landing page and remove shader ([@faw01](https://github.com/faw01))
- feat(seo): add metadata and json-ld package ([@faw01](https://github.com/faw01))
- feat(web): add landing page with shader splash screen ([@faw01](https://github.com/faw01))
- feat(design-system): add shadcn/ui components and theme ([@faw01](https://github.com/faw01))
- feat(next-config): add shared next.js configuration ([@faw01](https://github.com/faw01))
- feat(typescript-config): add nextjs, react-library, and convex configs ([@faw01](https://github.com/faw01))
- chore(config): add .next to gitignore ([@faw01](https://github.com/faw01))
- docs(docs): add agent workflow note to commands page ([@faw01](https://github.com/faw01))
- docs(docs): add agent context to structure and colocation pages ([@faw01](https://github.com/faw01))
- docs(docs): add agent-first narrative and roadmap page ([@faw01](https://github.com/faw01))
- fix(deploy): update mintlify subdomain to ocarinalabs ([@faw01](https://github.com/faw01))
- docs(readme): update branding and project description ([@faw01](https://github.com/faw01))
- chore(deps): add lockfile ([@faw01](https://github.com/faw01))
- feat(scripts): add story generation script ([@faw01](https://github.com/faw01))
- chore(dx): add editor and mcp configs ([@faw01](https://github.com/faw01))
- ci(github): add release workflow and dependabot ([@faw01](https://github.com/faw01))
- chore(github): add issue and pr templates ([@faw01](https://github.com/faw01))
- chore(github): add community health files ([@faw01](https://github.com/faw01))
- feat(docs): add documentation site ([@faw01](https://github.com/faw01))
- refactor(www): remove old website ([@faw01](https://github.com/faw01))
- feat(cli): add project template package scaffolds ([@faw01](https://github.com/faw01))
- feat(cli): add project template app scaffolds ([@faw01](https://github.com/faw01))
- feat(cli): add project template dx configs ([@faw01](https://github.com/faw01))
- feat(cli): add project template root configs ([@faw01](https://github.com/faw01))
- feat(cli): add cli build and init scripts ([@faw01](https://github.com/faw01))
- feat(cli): add new cli app with build system ([@faw01](https://github.com/faw01))
- refactor(cli): remove old fullstack-ai template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old fullstack template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old frontend template ([@faw01](https://github.com/faw01))
- refactor(cli): remove old cli source and build output ([@faw01](https://github.com/faw01))
- feat(design-system): add shared design system package ([@faw01](https://github.com/faw01))
- feat(next-config): add shared next.js config package ([@faw01](https://github.com/faw01))
- feat(typescript-config): add shared typescript config package ([@faw01](https://github.com/faw01))
- chore(deploy): add vercel deployment config ([@faw01](https://github.com/faw01))
- chore(root): add bun and lefthook configs ([@faw01](https://github.com/faw01))
- chore(root): add biome linting and formatting config ([@faw01](https://github.com/faw01))
- chore(root): add turborepo pipeline config ([@faw01](https://github.com/faw01))
- refactor(root): migrate package.json to turborepo workspaces ([@faw01](https://github.com/faw01))
- chore(root): remove old root tsconfig ([@faw01](https://github.com/faw01))
- docs(project): update project instructions with ultracite standards ([@faw01](https://github.com/faw01))
- chore(license): update copyright to Ocarina Labs ([@faw01](https://github.com/faw01))
- chore: update deps for react2shell, remove oss stats ([@faw01](https://github.com/faw01))
- feat: add signature ([@faw01](https://github.com/faw01))
- fix: build errror ([@faw01](https://github.com/faw01))
- chore: cleanup comments and lint ([@faw01](https://github.com/faw01))
- feat: refactor ai template, made code more modular ([@faw01](https://github.com/faw01))
- feat: update links ([@faw01](https://github.com/faw01))
- feat: update www ([@faw01](https://github.com/faw01))
- feat: cleanup, init docs with cli and add ai template ([@faw01](https://github.com/faw01))
- feat: add half-assed docs ([@faw01](https://github.com/faw01))
- feat: cleanup and finalise frontend template, added back convex for oss ([@faw01](https://github.com/faw01))
- feat: make responsive ([@faw01](https://github.com/faw01))
- feat: rerun init ([@faw01](https://github.com/faw01))
- feat: forgot to update ([@faw01](https://github.com/faw01))
- feat: update footer and website ([@faw01](https://github.com/faw01))
- feat: finish landing ([@faw01](https://github.com/faw01))
- feat: add website and change cli header ([@faw01](https://github.com/faw01))
- feat: cli working, migrate from mf squared to mf2 ([@faw01](https://github.com/faw01))
- feat: prep base-frontend ([@faw01](https://github.com/faw01))
- feat: create claude files ([@faw01](https://github.com/faw01))
- chore: lint and cleanup ([@faw01](https://github.com/faw01))
- feat: split ([@faw01](https://github.com/faw01))
- feat: more updates ([@faw01](https://github.com/faw01))
- init ([@faw01](https://github.com/faw01))

#### Authors: 1

- faw ([@faw01](https://github.com/faw01))
