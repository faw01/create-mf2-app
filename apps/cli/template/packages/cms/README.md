# @repo/cms

Content management with BaseHub.

## Usage

```ts
import { blog } from "@repo/cms";

const posts = await blog.getPosts();
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BASEHUB_TOKEN` | No | BaseHub API token (queries return empty results and the Feed/Toolbar components render nothing if not set) |

## Docs

[mf2.dev/docs/packages/cms](https://mf2.dev/docs/packages/cms)
