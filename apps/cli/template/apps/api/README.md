# API

Webhooks, cron jobs, and external integrations. Runs on port 3002.

## Development

```bash
turbo dev --filter=api
```

The dev task also starts `stripe listen` to forward webhooks to `localhost:3002/webhooks/payments`. It needs `STRIPE_SECRET_KEY` in `apps/api/.env.local` (or the shell environment) and the [Stripe CLI](https://docs.stripe.com/stripe-cli); when unset, it prints a skip line instead of starting.

## Key Features

- Stripe webhook handler (checkout, subscriptions)
- Clerk webhook handler (user/org sync to analytics)
- Health check endpoint at `/health`
- Cron job support

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | No | Clerk secret key |
| `CLERK_WEBHOOK_SECRET` | No | Clerk webhook signing secret |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |

See full list at [mf2.dev/docs/setup/env](https://mf2.dev/docs/setup/env).

## Docs

[mf2.dev/docs/apps/api](https://mf2.dev/docs/apps/api)
