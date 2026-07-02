# Convex Backend

Real-time backend powered by Convex with Clerk authentication.

## Module Structure

```
convex/
  auth/           # User management (Clerk webhook sync)
    tables.ts     # Users table schema
    users.ts      # Auth queries, mutations, helpers
  chat/           # AI chat module
    tables.ts     # Threads + messages schema
    api/
      threads.ts  # Thread CRUD
      messages.ts # Message CRUD + persist exchange
      title.ts    # Auto-title generation via AI
    search/
      threads.ts  # Full-text thread search
  email/          # Transactional email (Resend)
  settings/       # User settings
  stripe/         # Subscription management
  schema.ts       # Root schema (composed from module tables)
  convex.config.ts # Plugin registration
  convex.env.ts   # Typed environment variables
  auth.config.ts  # Clerk JWT provider
  http.ts         # Webhook router (Clerk, Resend, Stripe)
  crons.ts        # Scheduled jobs
  migrations.ts   # Migration runner
```

## Adding a New Module

1. Create `convex/<module>/tables.ts` with table definitions
2. Import and spread into `convex/schema.ts`
3. Create API files in `convex/<module>/api/`
4. Use `query`/`mutation` for public, `internalQuery`/`internalMutation` for private

## Auth Pattern

All public functions requiring auth should call `mustGetCurrentUser(ctx)`:

```typescript
import { mustGetCurrentUser } from "../auth/users";

export const myFunction = mutation({
  args: { /* ... */ },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    // user is guaranteed to exist
  },
});
```

## Environment Variables

Set in Convex dashboard. All optional; blank or missing disables that integration:
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk issuer URL (JWT template named `convex`)
- `CLERK_SECRET_KEY` - Clerk secret
- `CLERK_WEBHOOK_SECRET` - Clerk webhook signing
- `RESEND_API_KEY` - Resend email API key
- `RESEND_WEBHOOK_SECRET` - Resend webhook signing
- `AI_GATEWAY_API_KEY` - Vercel AI Gateway key
- `AI_GATEWAY_URL` - Gateway URL
- `SITE_URL` - App URL for Stripe redirects
