# Commits

Use conventional commits format for all commit messages.

## Structure

```
<type>(<scope>): <description>
```

Commits are always a single line. No body. No footer.

## Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, CI, or auxiliary tool changes |

## Guidelines

- **Type**: Always required (`feat`, `fix`, `refactor`, etc.)
- **Scope**: Always required. Indicates the affected area (e.g., `auth`, `api`, `ui`)
- **Description**: Use imperative mood ("add" not "added"), lowercase, no period
- **No body or footer**: NEVER add a body or footer. Keep commits to a single line header only, regardless of complexity.
- **No co-authoring**: Never add `Co-Authored-By` or similar footers.

## Examples

```
feat(auth): add OAuth2 login support
fix(workers): resolve memory leak in pool
refactor(api): simplify error handling logic
feat(notifications): add real-time user notifications
chore(deps): update dependencies
docs(readme): add setup instructions
```

## Cursor Cloud specific instructions

This repo is the `create-mf2-app` monorepo (a Bun + Turborepo workspace), not a scaffolded app. Bun is the package manager (pinned via `packageManager` in `package.json`) and is installed to `~/.bun/bin` (added to `~/.bashrc` by the installer, so interactive shells find it automatically). The update script keeps Bun and `bun install` current.

Runnable pieces and how to exercise them (commands live in the root and per-package `package.json` / CI at `.github/workflows/ci.yml`):

- CLI (`apps/cli`, the published product `create-mf2-app`): lint `bun run check`, test `bun test apps/cli/scripts/`, build `bun run build --filter=create-mf2-app`. Run it end-to-end non-interactively with `node apps/cli/dist/index.js <name> --package-manager bun` (add `--disable-git` to skip the git commit). Scaffolding runs a full `bun install` for the generated 8-app/22-package monorepo (~5500 packages), so it is slow but works offline against cached deps.
- `apps/web`: Next.js marketing site, `bun run dev --filter=web` serves on port 3001.
- `apps/docs`: Mintlify docs, `bun run dev --filter=docs` (port 3004) — requires the global `mint` CLI (`bun add -g mint` / `npm i -g mint`), which is not part of the update script; treat as optional.

Non-obvious gotchas:

- `apps/cli/template/**` is the scaffold payload and is intentionally excluded from `bun run check` (Biome) and `react-doctor`; do not lint/typecheck it as part of this repo. CI typechecks the template separately by running `bun install` + `bun run typecheck` inside `apps/cli/template`.
- `bunfig.toml` enables an isolated linker and a 3-day `minimumReleaseAge` cooldown on newly published packages; `bun install` respects the committed lockfile so this does not block installs.
- `typecheck` scripts use `tsgo` (from `@typescript/native-preview`), only available inside packages/apps that depend on it — not from the repo root.
