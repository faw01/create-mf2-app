# @repo/webhooks

Outbound webhook delivery with Svix.

## Usage

```ts
import { webhooks } from "@repo/webhooks";

// orgId from the Clerk session; no-ops with a skip log until SVIX_TOKEN is set
await webhooks.send("invoice.created", { invoiceId });

// Explicit orgId for callers without a session (crons, Convex-triggered handlers)
await webhooks.send("task.completed", { taskId }, { orgId });
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SVIX_TOKEN` | No | Svix API token |

## Docs

[mf2.dev/docs/packages/webhooks](https://mf2.dev/docs/packages/webhooks)
