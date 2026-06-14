# @repo/notifications

In-app notification feeds using Knock.

## Usage

```ts
import { notifications } from "@repo/notifications";

// undefined until KNOCK_SECRET_API_KEY is set; no-op with a skip log
if (notifications) {
  await notifications.workflows.trigger("welcome", { recipients: [userId] });
} else {
  console.warn("Skipping notification: set KNOCK_SECRET_API_KEY to enable");
}
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KNOCK_API_KEY` | No | Knock API key |
| `KNOCK_SECRET_API_KEY` | No | Knock secret API key |
| `KNOCK_FEED_CHANNEL_ID` | No | Knock feed channel ID |
| `NEXT_PUBLIC_KNOCK_API_KEY` | No | Knock client-side API key |
| `NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID` | No | Knock client-side feed channel ID |

## Docs

[mf2.dev/docs/packages/notifications](https://mf2.dev/docs/packages/notifications)
