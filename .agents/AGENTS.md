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
- **Code review first**: Before committing, run `coderabbit review --prompt-only` for AI-driven code review.

## Examples

```
feat(auth): add OAuth2 login support
fix(workers): resolve memory leak in pool
refactor(api): simplify error handling logic
feat(notifications): add real-time user notifications
chore(deps): update dependencies
docs(readme): add setup instructions
```
