# @repo/backend

Real-time database and serverless functions using Convex.

## Usage

Schema at `convex/schema.ts`, functions at `convex/<module>/api/`.

```ts
import { mustGetCurrentUser } from "../auth/users";

export const myFunction = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await mustGetCurrentUser(ctx);
    // user is guaranteed to exist
  },
});
```

## Environment Variables

Set in Convex dashboard. All are optional: a blank or missing value disables that integration.

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_JWT_ISSUER_DOMAIN` | No | Clerk issuer URL from the JWT template named `convex` ([guide](https://clerk.com/docs/integrations/databases/convex)) |
| `CLERK_SECRET_KEY` | No | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | No | Clerk webhook signing secret |
| `RESEND_API_KEY` | No | Resend email API key |
| `RESEND_WEBHOOK_SECRET` | No | Resend webhook signing secret ([webhook settings](https://resend.com/webhooks)) |
| `AI_GATEWAY_API_KEY` | No | Vercel AI Gateway key |
| `AI_GATEWAY_URL` | No | Gateway URL |
| `SITE_URL` | No | App URL for Stripe redirects |

## Docs

[mf2.dev/docs/packages/backend](https://mf2.dev/docs/packages/backend)
