---
name: convex-conventions
description:
  This repo's own conventions for writing Convex functions in
  packages/backend, verified against the source. Use alongside the vendored
  convex skill for any Convex work: schema, queries, mutations, actions,
  auth checks, codegen, or local dev without an account.
---

# Convex

Backend code lives in `packages/backend/convex/`. Schema at `convex/schema.ts`
(composed from per-module `tables.ts` files), functions at
`convex/<module>/`. These conventions are offline: everything here is
verifiable against the source in this repo.

## The circular-inference rule (read this first)

An action that calls back into its own deployment via `ctx.runQuery`,
`ctx.runMutation`, or `ctx.runAction` on `api.*` or `internal.*` creates a
type cycle: the generated `api` type needs the action's return type, which
needs the `runQuery` result type, which needs `api`. TypeScript gives up and
infers `any` for the WHOLE `api` object. Every consumer's `useQuery(...)`
then returns `any`, silently disabling type safety across the repo. The
errors surface far from the cause (TS7022/TS7006 in unrelated frontend
files).

Break the cycle at both ends, always:

```ts
export const summarize = action({
  args: { threadId: v.id("threads") },
  returns: v.object({ summary: v.string() }),
  // 1. Explicit return type on the handler
  handler: async (ctx, args): Promise<{ summary: string }> => {
    // 2. Explicit type on every runQuery/runMutation/runAction result
    const messages: Array<{ role: string; content: string }> =
      await ctx.runQuery(internal.chat.api.messages.getHistory, {
        threadId: args.threadId,
      });
    // ...
  },
});
```

`returns:` validators do not break the cycle; only TypeScript annotations
do. Calls to `components.*` (Stripe, Resend, ...) are safe: component types
do not reference this app's `api`. See `convex/chat/api/title.ts` and
`convex/auth/users.ts` for the shipped pattern.

## Every function: args and returns validators

```ts
export const setTitle = mutation({
  args: { threadId: v.id("threads"), title: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    // ...
    return null;
  },
});
```

Handlers that return nothing declare `returns: v.null()` and explicitly
`return null`.

## Public vs internal functions

- `query` / `mutation` / `action`: exposed to clients, must validate auth.
- `internalQuery` / `internalMutation` / `internalAction`: callable only
  from other Convex functions (crons, schedulers, webhooks, other actions).

Anything invoked by `ctx.scheduler`, `ctx.runQuery`-from-actions, crons, or
HTTP handlers should be internal unless a client genuinely calls it.

## Auth seams (convex/auth/users.ts)

- `mustGetCurrentUser(ctx)`: returns `Doc<"users">` or throws. Use at the
  top of any authenticated query/mutation.
- `getCurrentUser(ctx)`: same but returns `null` instead of throwing.
- `getOrgContext(ctx)`: returns `{ user, orgId }` where `orgId` comes from
  the Clerk JWT `org_id` claim. Use for org-scoped data.

These helpers take a `QueryCtx` and therefore work in queries and mutations
only, which leads to:

## Actions have no ctx.db

`ActionCtx` has no `db`. Passing an action's ctx to a `QueryCtx` helper
(`mustGetCurrentUser`, `getOrgContext`, anything that touches `ctx.db`) is
both a type error and a latent runtime crash. Inside an action, either:

- read claims straight off the identity, no db round-trip (this is how
  `convex/stripe/index.ts` scopes by `identity.subject`):

```ts
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Not authenticated");
}
const orgId =
  typeof identity.org_id === "string" ? identity.org_id : undefined;
```

- or `ctx.runQuery` an internal query that does the db work (then apply the
  circular-inference rule above).

## Table-name-first db API

This repo's Convex version takes the table name as the first argument:

```ts
await ctx.db.get("users", id);
await ctx.db.patch("users", id, { clerkUser });
await ctx.db.delete("messages", messageId);
await ctx.db.insert("messages", { threadId, role, content });
```

Reads use indexes, not filters:

```ts
ctx.db
  .query("messages")
  .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
  .order("asc")
  .collect();
```

Define indexes on the table (`convex/<module>/tables.ts`) for every access
pattern you query by.

## Zero-keys clients

With no Convex URL configured, `ConvexClientProvider` renders children
without a Convex context and every `useQuery`/`useMutation`/`useAction`
throws at runtime. Wrap Convex-consuming subtrees in `ConvexGate` from
`@repo/convex/provider` (native: `provider.native`), or branch on
`useConvexConfigured()`.

## Codegen and local dev without an account

`convex/_generated/` is committed, so typecheck and tests work with no
deployment at all. To run the backend or regenerate types after schema
changes, run plain `bunx convex dev` in `packages/backend`:

- Not logged in, or stdin is not a TTY (agents): creates a free anonymous
  local deployment automatically. Set `CONVEX_AGENT_MODE=anonymous` to
  force this path regardless of login state.
- Do NOT follow CLI hints toward `npx convex deployment create local` or
  `npx convex deployment select local`; those require a logged-in account
  and fail with "Cannot create a deployment in anonymous mode".
- `bunx convex codegen` only works once a deployment exists; `bunx convex
  dev --once` both creates one and regenerates `_generated/`. After that
  one-time setup, `npx convex codegen` auto-starts the local backend itself.
- In fully network-less environments, hand-edit `_generated/api.d.ts`
  instead: one import line plus one `fullApi` entry per new module.

Commit `_generated/` changes together with the schema change that caused
them.

## Testing

Use `convex-test` (in-memory, no running backend needed). Bootstrap with
the shipped module glob, seed with `t.run`, and act as a user with
`t.withIdentity`:

```ts
import { convexTest } from "convex-test";
import schema from "../schema";
import { modules } from "../test.setup";

const t = convexTest(schema, modules);
const asUser = t.withIdentity({ subject, org_id, org_role: "org:member" });
```

Test files go in `packages/backend/tests/` or next to the module under
test; `bun run test --filter=@repo/backend` runs them.

## Optional: official Convex guidance

With network access, `npx convex ai-files install` installs Convex's
managed AI guidelines ([docs.convex.dev/ai](https://docs.convex.dev/ai)),
a useful complement to this file. This skill does not depend on it.
